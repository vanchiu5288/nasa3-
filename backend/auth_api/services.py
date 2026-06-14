import ssl
import datetime
import jwt
import logging
from django.conf import settings
from django.contrib.auth import authenticate
from ldap3 import Server, Connection, Tls, ALL
from ldap3.core.exceptions import LDAPBindError, LDAPSocketOpenError

LDAP_SERVER = 'nasaldap.nasa'
LDAP_PORT = 636
BASE_DN = 'dc=csie,dc=ntu,dc=edu,dc=tw'
CA_CERT_PATH = 'nasaldap_ca.crt' 

logger = logging.getLogger(__name__)

def authenticate_user_hybrid(username, password):
    """
    混合認證：先查本地 Django 資料庫，沒有的話再去查 LDAP
    """
    logger.info(f"開始執行混合認證，嘗試登入帳號: {username}")
    local_user = authenticate(username=username, password=password)
    if local_user is not None:
        logger.info(f"本地 Django 資料庫認證成功: {username}")
        return True, {
            "username": local_user.username,
            "gid": 0, 
            "is_admin": local_user.is_superuser
        }
    logger.info(f"本地無此帳號，轉向 LDAP 認證: {username}")
    tls_configuration = Tls(validate=ssl.CERT_REQUIRED, version=ssl.PROTOCOL_TLSv1_2, ca_certs_file=CA_CERT_PATH)
    server = Server(LDAP_SERVER, port=LDAP_PORT, use_ssl=True, tls=tls_configuration, get_info=ALL)
    user_dn = f"uid={username},ou=people,{BASE_DN}"
    
    try:
        conn = Connection(server, user=user_dn, password=password, auto_bind=True)
        conn.search(search_base=user_dn, search_filter='(objectclass=*)', attributes=['uid', 'gidNumber'])
        
        user_info = {}
        if conn.entries:
            entry = conn.entries[0]
            uid_val = entry.uid.value if 'uid' in entry else username
            gid_val = entry.gidNumber.value if 'gidNumber' in entry else None
            user_info = {
                "username": str(uid_val),
                "gid": int(gid_val) if gid_val is not None else None,
                "is_admin": False 
            }
        conn.unbind()
        logger.info(f"LDAP 認證成功: {username}")
        return True, user_info
        
    except LDAPBindError:
        logger.warning(f"LDAP 認證失敗，帳號或密碼錯誤: {username}")
        return False, "帳號或密碼錯誤"
    except LDAPSocketOpenError:
        logger.error(f"無法連線至 LDAP 伺服器 ({LDAP_SERVER}:{LDAP_PORT}): {str(e)}")
        return False, "無法連線至 LDAP 伺服器，請檢查網路或憑證設定"
    except Exception as e:
        logger.exception(f"LDAP 認證過程中發生未知的內部系統錯誤: {username}")
        return False, f"內部系統錯誤: {str(e)}"

def generate_jwt_token(user_info):
    username = user_info.get('username')
    try:
        payload = {
            'username': user_info.get('username'),
            'gid': user_info.get('gid'),
            'is_admin': user_info.get('is_admin', False),
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2),
            'iat': datetime.datetime.utcnow()
        }
        secret_key = getattr(settings, 'SECRET_KEY', 'your-fallback-secret-key')
        logger.info(f"成功為使用者 {username} 產生 JWT Token")
        token = jwt.encode(payload, secret_key, algorithm='HS256')
        
        logger.info(f"成功為使用者 {username} 產生 JWT Token")
        return token
    except Exception as e:
        logger.exception(f"產生 JWT Token 時發生錯誤，使用者: {username}")
        raise
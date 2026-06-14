import ssl
import datetime
import jwt
from django.conf import settings
from django.contrib.auth import authenticate
from ldap3 import Server, Connection, Tls, ALL
from ldap3.core.exceptions import LDAPBindError, LDAPSocketOpenError

LDAP_SERVER = 'nasaldap.nasa'
LDAP_PORT = 636
BASE_DN = 'dc=csie,dc=ntu,dc=edu,dc=tw'
CA_CERT_PATH = 'nasaldap_ca.crt' 

def authenticate_user_hybrid(username, password):
    """
    混合認證：先查本地 Django 資料庫，沒有的話再去查 LDAP
    """
    local_user = authenticate(username=username, password=password)
    if local_user is not None:
        return True, {
            "username": local_user.username,
            "gid": 0, 
            "is_admin": local_user.is_superuser
        }
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
        return True, user_info
        
    except LDAPBindError:
        return False, "帳號或密碼錯誤"
    except LDAPSocketOpenError:
        return False, "無法連線至 LDAP 伺服器，請檢查網路或憑證設定"
    except Exception as e:
        return False, f"內部系統錯誤: {str(e)}"

def generate_jwt_token(user_info):
    payload = {
        'username': user_info.get('username'),
        'gid': user_info.get('gid'),
        'is_admin': user_info.get('is_admin', False),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2),
        'iat': datetime.datetime.utcnow()
    }
    secret_key = getattr(settings, 'SECRET_KEY', 'your-fallback-secret-key')
    return jwt.encode(payload, secret_key, algorithm='HS256')
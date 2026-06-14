import ssl
import datetime
import jwt
from django.conf import settings
from ldap3 import Server, Connection, Tls, ALL
from ldap3.core.exceptions import LDAPBindError, LDAPSocketOpenError

# --- LDAP 伺服器配置 ---
LDAP_SERVER = 'mockldap.nasa'
LDAP_PORT = 636
BASE_DN = 'dc=csie,dc=ntu,dc=edu,dc=tw'
CA_CERT_PATH = 'mockldap_ca.crt'  # 建議將憑證放在專案根目錄，或於 settings 中設定絕對路徑

def authenticate_via_ldap(username, password):
    """
    透過 LDAP 驗證使用者帳號密碼，並撈取該用戶在 LDAP 中的基本屬性
    :return: (bool, dict/str) -> (是否成功, 用戶資料或錯誤訊息)
    """
    # 設定 TLS 與憑證驗證
    tls_configuration = Tls(
        validate=ssl.CERT_REQUIRED, 
        version=ssl.PROTOCOL_TLSv1_2, 
        ca_certs_file=CA_CERT_PATH
    )
    
    server = Server(
        LDAP_SERVER, 
        port=LDAP_PORT, 
        use_ssl=True, 
        tls=tls_configuration, 
        get_info=ALL
    )
    
    # 依照你的樹狀結構組合 User DN
    user_dn = f"uid={username},ou=people,{BASE_DN}"
    
    try:
        # 嘗試進行 Bind (登入認證)
        conn = Connection(server, user=user_dn, password=password, auto_bind=True)
        
        # 登入成功後，順便查詢該用戶的屬性（例如：gidNumber 判斷身份）
        conn.search(
            search_base=user_dn, 
            search_filter='(objectclass=*)', 
            attributes=['uid', 'gidNumber']
        )
        
        user_info = {}
        if conn.entries:
            entry = conn.entries[0]
            user_info = {
                "username": str(entry.uid),
                "gid": int(str(entry.gidNumber)) if 'gidNumber' in entry else None
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
    """
    根據 LDAP 撈出來的用戶資訊，核發簽署的 JWT Token
    """
    # 定義 JWT Payload 內容
    payload = {
        'username': user_info.get('username'),
        'gid': user_info.get('gid'),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2),  # 2小時後過期
        'iat': datetime.datetime.utcnow()                                # 簽發時間
    }
    
    # 使用 Django settings.py 裡的 SECRET_KEY 進行加密簽署
    # 如果 settings 沒設定，則 fallback 到一個字串 (正式環境務必使用安全密鑰)
    secret_key = getattr(settings, 'SECRET_KEY', 'your-fallback-secret-key')
    
    # 產生 Token
    token = jwt.encode(payload, secret_key, algorithm='HS256')
    return token
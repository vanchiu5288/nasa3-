from django.urls import path
from .views import LoginView

urlpatterns = [
    # 對應到 /api/login (實際完整網址取決於專案根目錄的 urls.py 如何 include)
    path('login/', LoginView.as_view(), name='ldap_login'),
]
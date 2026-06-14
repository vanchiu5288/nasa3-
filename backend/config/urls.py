"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from auth_api.views import LoginView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/heatmap/', include('heatmap.urls')),

    path('api/iperf/', include('iperf_api.urls')),
    path('login', LoginView.as_view(), name='ldap_login'),
    path('api/', include('auth_api.urls')),

    path('api/iperf/', include('iperf_api.urls')),
    path("api/monitoring/", include("monitoring.urls")),

]

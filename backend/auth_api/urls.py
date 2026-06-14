from django.urls import path
from .views import LoginView, DiscordWebhookView

urlpatterns = [
    path("login/", LoginView.as_view(), name="ldap_login"),
    path("discord-webhook/", DiscordWebhookView.as_view(), name="discord_webhook"),
]
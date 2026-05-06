from django.urls import path
from . import views

urlpatterns = [
    path("", views.heatmap_data, name="heatmap-data"),
    path("measurements/", views.measurement_list, name="measurement-list"),
    path("measurements/create/", views.create_measurement, name="create-measurement"),
]

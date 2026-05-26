from django.urls import path
from . import views

urlpatterns = [
    # 取得熱力圖資料
    path("", views.heatmap_data, name="heatmap-data"),

    # 取得原始測量紀錄列表
    path("measurements/", views.measurement_list, name="measurement-list"),

    # 建立一筆測量紀錄：前端點座標 + keyword，後端查 vSZ 後存 DB
    path("measurements/create/", views.create_measurement, name="create-measurement"),
    path("measurements/<int:measurement_id>/", views.delete_measurement, name="delete-measurement"),
]

from django.urls import path
from . import views

app_name = "product"

urlpatterns = [
    path("", views.product_list, name="product_list"),
    path("detail/", views.product_detail, name="product_detail"),
    path("detail/<uuid:pk>/", views.product_detail2, name="product_detail2"),
    path("api/data/", views.product_list_api, name= "product_list_api"),
]
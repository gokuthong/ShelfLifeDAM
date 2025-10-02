from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'assets', views.AssetViewSet, basename='asset')
router.register(r'metadata', views.MetadataViewSet, basename='metadata')

urlpatterns = [
    path('', include(router.urls)),
    path('upload/', views.upload_asset, name='upload_asset'),
    path('search/', views.search_assets, name='search_assets'),
]
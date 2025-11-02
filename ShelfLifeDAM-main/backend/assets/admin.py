from django.contrib import admin
from .models import Asset, Metadata, AssetVersion

@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ('title', 'file_type', 'user', 'version', 'file_size', 'created_at', 'is_active')
    list_filter = ('file_type', 'is_active', 'created_at', 'user')
    search_fields = ('title', 'description', 'tags')
    readonly_fields = ('asset_id', 'created_at', 'updated_at')
    list_per_page = 20

@admin.register(Metadata)
class MetadataAdmin(admin.ModelAdmin):
    list_display = ('asset', 'field_name', 'field_value', 'created_at')
    list_filter = ('field_name', 'created_at')
    search_fields = ('asset__title', 'field_name', 'field_value')
    readonly_fields = ('metadata_id', 'created_at', 'updated_at')

@admin.register(AssetVersion)
class AssetVersionAdmin(admin.ModelAdmin):
    list_display = ('asset', 'version_number', 'created_by', 'file_size', 'created_at')
    list_filter = ('version_number', 'created_at')
    search_fields = ('asset__title', 'changes')
    readonly_fields = ('version_id', 'created_at')
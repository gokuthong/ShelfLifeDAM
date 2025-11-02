from rest_framework import serializers
from .models import Asset, Metadata, AssetVersion
from users.serializers import UserSerializer


class MetadataSerializer(serializers.ModelSerializer):
    class Meta:
        model = Metadata
        fields = ('metadata_id', 'field_name', 'field_value', 'created_at', 'updated_at')


class AssetVersionSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = AssetVersion
        fields = ('version_id', 'version_number', 'file', 'file_size', 'changes', 'created_by', 'created_at')


class AssetSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    metadata_fields = MetadataSerializer(many=True, read_only=True)
    versions = AssetVersionSerializer(many=True, read_only=True)
    file_url = serializers.SerializerMethodField()
    file_extension = serializers.SerializerMethodField()

    class Meta:
        model = Asset
        fields = (
            'asset_id', 'user', 'file', 'file_url', 'file_type', 'title',
            'description', 'tags', 'version', 'file_size', 'mime_type',
            'file_extension', 'metadata_fields', 'versions', 'is_active',
            'created_at', 'updated_at'
        )
        read_only_fields = ('asset_id', 'user', 'file_size', 'mime_type', 'created_at', 'updated_at')

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None

    def get_file_extension(self, obj):
        return obj.file_extension


class AssetCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ('file', 'title', 'description', 'tags', 'file_type')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class AssetUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ('title', 'description', 'tags')

    def update(self, instance, validated_data):
        # Create a new version if file is being updated
        if 'file' in self.context['request'].FILES:
            old_file = instance.file
            # Create version record
            AssetVersion.objects.create(
                asset=instance,
                version_number=instance.version,
                file=old_file,
                file_size=old_file.size,
                changes="File updated",
                created_by=self.context['request'].user
            )
            instance.version += 1
        return super().update(instance, validated_data)
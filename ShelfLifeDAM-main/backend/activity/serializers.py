from rest_framework import serializers
from .models import ActivityLog, Comment
from users.serializers import UserSerializer
from assets.serializers import AssetSerializer


class ActivityLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    asset = AssetSerializer(read_only=True)

    class Meta:
        model = ActivityLog
        fields = ('log_id', 'asset', 'user', 'action', 'details', 'ip_address', 'user_agent', 'timestamp')


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    asset = AssetSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ('comment_id', 'asset', 'user', 'content', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('comment_id', 'user', 'asset', 'created_at', 'updated_at')


class CommentCreateSerializer(serializers.ModelSerializer):
    asset = serializers.UUIDField(write_only=True)

    class Meta:
        model = Comment
        fields = ('content', 'asset')

    def create(self, validated_data):
        # Extract asset UUID and convert to asset_id for ForeignKey
        asset_uuid = validated_data.pop('asset')
        validated_data['asset_id'] = asset_uuid
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
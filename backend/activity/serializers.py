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
    class Meta:
        model = Comment
        fields = ('content',)

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['asset_id'] = self.context['asset_id']
        return super().create(validated_data)
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from .models import ActivityLog, Comment
from .serializers import ActivityLogSerializer, CommentSerializer, CommentCreateSerializer


class ActivityLogViewSet(ModelViewSet):
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['action', 'user', 'asset']
    ordering_fields = ['timestamp']
    ordering = ['-timestamp']

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return ActivityLog.objects.all()
        else:
            # Users can only see activities for assets they have access to
            from assets.models import Asset
            accessible_assets = Asset.objects.filter(
                Q(user=user) | Q(is_active=True)
            )
            return ActivityLog.objects.filter(asset__in=accessible_assets)


class CommentViewSet(ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['asset', 'user']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Comment.objects.all()
        else:
            from assets.models import Asset
            accessible_assets = Asset.objects.filter(
                Q(user=user) | Q(is_active=True)
            )
            return Comment.objects.filter(asset__in=accessible_assets, is_active=True)

    def get_serializer_class(self):
        if self.action == 'create':
            return CommentCreateSerializer
        return CommentSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.action == 'create' and 'asset_id' in self.kwargs:
            context['asset_id'] = self.kwargs['asset_id']
        return context

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(['GET'])
def recent_activity(request):
    limit = request.GET.get('limit', 10)
    try:
        limit = min(int(limit), 50)  # Max 50 records
    except ValueError:
        limit = 10

    activities = ActivityLog.objects.all()[:limit]
    serializer = ActivityLogSerializer(activities, many=True)
    return Response(serializer.data)
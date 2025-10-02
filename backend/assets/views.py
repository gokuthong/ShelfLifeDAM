from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.viewsets import ModelViewSet
from django.db.models import Q
from .models import Asset, Metadata, AssetVersion
from .serializers import AssetSerializer, AssetCreateSerializer, AssetUpdateSerializer, MetadataSerializer, \
    AssetVersionSerializer


class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user or request.user.is_admin


class IsEditorOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_editor or request.user.is_admin)


class AssetViewSet(ModelViewSet):
    serializer_class = AssetSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['file_type', 'user', 'is_active']
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['created_at', 'updated_at', 'file_size', 'title']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Asset.objects.all()
        elif user.is_editor:
            return Asset.objects.filter(Q(user=user) | Q(is_active=True))
        else:  # viewer
            return Asset.objects.filter(is_active=True)

    def get_serializer_class(self):
        if self.action == 'create':
            return AssetCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return AssetUpdateSerializer
        return AssetSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsEditorOrAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]


@api_view(['POST'])
def upload_asset(request):
    if not request.user.is_editor and not request.user.is_admin:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    serializer = AssetCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        asset = serializer.save()
        return Response(AssetSerializer(asset, context={'request': request}).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def search_assets(request):
    query = request.GET.get('q', '')
    file_type = request.GET.get('file_type', '')
    tags = request.GET.getlist('tags')
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')

    assets = Asset.objects.filter(is_active=True)

    if not request.user.is_admin:
        if request.user.is_editor:
            assets = assets.filter(Q(user=request.user) | Q(is_active=True))
        else:  # viewer
            assets = assets.filter(is_active=True)

    if query:
        assets = assets.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query) |
            Q(tags__contains=[query])
        )

    if file_type:
        assets = assets.filter(file_type=file_type)

    if tags:
        for tag in tags:
            assets = assets.filter(tags__contains=[tag])

    if date_from:
        assets = assets.filter(created_at__gte=date_from)

    if date_to:
        assets = assets.filter(created_at__lte=date_to)

    serializer = AssetSerializer(assets, many=True, context={'request': request})
    return Response(serializer.data)


class MetadataViewSet(ModelViewSet):
    serializer_class = MetadataSerializer
    permission_classes = [permissions.IsAuthenticated, IsEditorOrAdmin]

    def get_queryset(self):
        return Metadata.objects.filter(asset__user=self.request.user)

    def perform_create(self, serializer):
        asset = serializer.validated_data['asset']
        if asset.user != self.request.user and not self.request.user.is_admin:
            raise permissions.PermissionDenied("You don't have permission to add metadata to this asset")
        serializer.save()
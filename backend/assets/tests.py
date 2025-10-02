from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
import json
from .models import Asset, Metadata

User = get_user_model()


class AssetModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            role='editor'
        )

        self.asset = Asset.objects.create(
            user=self.user,
            file=SimpleUploadedFile("test.jpg", b"file_content", content_type="image/jpeg"),
            file_type='image',
            title='Test Asset',
            description='Test Description',
            tags=['test', 'image']
        )

    def test_asset_creation(self):
        """Test asset creation and string representation"""
        self.assertEqual(str(self.asset), 'Test Asset (v1)')
        self.assertEqual(self.asset.user.username, 'testuser')
        self.assertEqual(self.asset.file_type, 'image')
        self.assertIn('test', self.asset.tags)

    def test_metadata_creation(self):
        """Test metadata creation for assets"""
        metadata = Metadata.objects.create(
            asset=self.asset,
            field_name='copyright',
            field_value='Test Company 2024'
        )

        self.assertEqual(str(metadata), 'Test Asset - copyright')
        self.assertEqual(metadata.field_value, 'Test Company 2024')


class AssetAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='adminpass123',
            role='admin'
        )
        self.editor_user = User.objects.create_user(
            username='editor',
            email='editor@example.com',
            password='editorpass123',
            role='editor'
        )
        self.viewer_user = User.objects.create_user(
            username='viewer',
            email='viewer@example.com',
            password='viewerpass123',
            role='viewer'
        )

        self.asset = Asset.objects.create(
            user=self.editor_user,
            file=SimpleUploadedFile("test.jpg", b"file_content", content_type="image/jpeg"),
            file_type='image',
            title='Test Asset',
            description='Test Description'
        )

    def test_asset_list_as_admin(self):
        """Test that admin can see all assets"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/assets/assets/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_asset_list_as_editor(self):
        """Test that editor can see their own assets and public ones"""
        self.client.force_authenticate(user=self.editor_user)
        response = self.client.get('/api/assets/assets/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_asset_upload_permission(self):
        """Test that only editors and admins can upload assets"""
        self.client.force_authenticate(user=self.viewer_user)

        file_data = SimpleUploadedFile("test.jpg", b"file_content", content_type="image/jpeg")
        data = {
            'file': file_data,
            'title': 'New Asset',
            'file_type': 'image'
        }

        response = self.client.post('/api/assets/assets/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_asset_search(self):
        """Test asset search functionality"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/assets/search/?q=Test')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_asset_filter_by_type(self):
        """Test filtering assets by file type"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/assets/assets/?file_type=image')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
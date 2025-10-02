from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import os
import uuid

User = get_user_model()


def asset_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return f"assets/{instance.user.id}/{filename}"


class Asset(models.Model):
    FILE_TYPE_CHOICES = (
        ('image', 'Image'),
        ('video', 'Video'),
        ('pdf', 'PDF'),
        ('doc', 'Document'),
        ('audio', 'Audio'),
        ('other', 'Other'),
    )

    asset_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assets')
    file = models.FileField(upload_to=asset_upload_path)
    file_type = models.CharField(max_length=10, choices=FILE_TYPE_CHOICES)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    tags = models.JSONField(default=list, blank=True)  # Storing tags as JSON array
    version = models.PositiveIntegerField(default=1)
    file_size = models.BigIntegerField(default=0)  # Size in bytes
    mime_type = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'assets'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['file_type']),
            models.Index(fields=['created_at']),
            models.Index(fields=['user', 'file_type']),
        ]

    def __str__(self):
        return f"{self.title} (v{self.version})"

    def save(self, *args, **kwargs):
        if self.file:
            self.file_size = self.file.size
            # Determine file type from MIME type or extension
            if not self.file_type:
                ext = os.path.splitext(self.file.name)[1].lower()
                if ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']:
                    self.file_type = 'image'
                elif ext in ['.mp4', '.avi', '.mov', '.wmv', '.flv']:
                    self.file_type = 'video'
                elif ext in ['.pdf']:
                    self.file_type = 'pdf'
                elif ext in ['.doc', '.docx', '.txt', '.rtf']:
                    self.file_type = 'doc'
                elif ext in ['.mp3', '.wav', '.ogg']:
                    self.file_type = 'audio'
                else:
                    self.file_type = 'other'
        super().save(*args, **kwargs)

    @property
    def file_url(self):
        return self.file.url if self.file else None

    @property
    def file_extension(self):
        return os.path.splitext(self.file.name)[1].lower() if self.file else ''


class Metadata(models.Model):
    metadata_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='metadata_fields')
    field_name = models.CharField(max_length=100)
    field_value = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'metadata'
        unique_together = ('asset', 'field_name')
        indexes = [
            models.Index(fields=['asset', 'field_name']),
        ]

    def __str__(self):
        return f"{self.asset.title} - {self.field_name}"


class AssetVersion(models.Model):
    version_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='versions')
    version_number = models.PositiveIntegerField()
    file = models.FileField(upload_to=asset_upload_path)
    file_size = models.BigIntegerField(default=0)
    changes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'asset_versions'
        unique_together = ('asset', 'version_number')
        ordering = ['-version_number']

    def __str__(self):
        return f"{self.asset.title} - v{self.version_number}"
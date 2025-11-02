from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid


def avatar_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return f"avatars/{instance.id}/{filename}"


class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('editor', 'Editor'),
        ('viewer', 'Viewer'),
    )

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='viewer')
    profile_info = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to=avatar_upload_path, blank=True, null=True)

    class Meta:
        db_table = 'users'

    def save(self, *args, **kwargs):
        # Automatically set superusers and staff as admin role
        if self.is_superuser or self.is_staff:
            self.role = 'admin'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.role})"

    @property
    def avatar_url(self):
        return self.avatar.url if self.avatar else None

    @property
    def is_admin(self):
        return self.role == 'admin' or self.is_superuser

    @property
    def is_editor(self):
        return self.role == 'editor'

    @property
    def is_viewer(self):
        return self.role == 'viewer'
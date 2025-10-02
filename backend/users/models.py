from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('editor', 'Editor'),
        ('viewer', 'Viewer'),
    )

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='viewer')
    profile_info = models.TextField(blank=True, null=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f"{self.username} ({self.role})"

    @property
    def is_admin(self):
        return self.role == 'admin'

    @property
    def is_editor(self):
        return self.role == 'editor'

    @property
    def is_viewer(self):
        return self.role == 'viewer'
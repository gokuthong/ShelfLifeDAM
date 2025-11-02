from django.core.management.base import BaseCommand
from users.models import User


class Command(BaseCommand):
    help = 'Fix superuser roles to admin'

    def handle(self, *args, **options):
        superusers = User.objects.filter(is_superuser=True)
        count = 0

        for user in superusers:
            if user.role != 'admin':
                user.role = 'admin'
                user.save()
                count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Updated {user.username} to admin role')
                )

        if count == 0:
            self.stdout.write(self.style.WARNING('No superusers needed updating'))
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Successfully updated {count} superuser(s) to admin role')
            )

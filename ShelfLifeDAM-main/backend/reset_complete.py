import os
import subprocess
import sys
import glob


def reset_database():
    print("🚀 Starting complete database reset...")

    # Delete all migration files
    migration_files = (
            glob.glob('users/migrations/0*.py') +
            glob.glob('assets/migrations/0*.py') +
            glob.glob('activity/migrations/0*.py')
    )

    for file in migration_files:
        try:
            os.remove(file)
            print(f"✅ Deleted: {file}")
        except Exception as e:
            print(f"⚠️ Could not delete {file}: {e}")

    # Ensure __init__.py files exist
    for app in ['users', 'assets', 'activity']:
        init_file = f'{app}/migrations/__init__.py'
        if not os.path.exists(init_file):
            open(init_file, 'w').close()
            print(f"✅ Created: {init_file}")

    print("🔄 Creating migrations...")

    # Create migrations in correct order
    subprocess.run([sys.executable, 'manage.py', 'makemigrations', 'users'], check=True)
    subprocess.run([sys.executable, 'manage.py', 'makemigrations', 'assets'], check=True)
    subprocess.run([sys.executable, 'manage.py', 'makemigrations', 'activity'], check=True)
    subprocess.run([sys.executable, 'manage.py', 'makemigrations'], check=True)

    print("🔄 Applying migrations...")

    # Apply migrations in correct order
    subprocess.run([sys.executable, 'manage.py', 'migrate', 'users'], check=True)
    subprocess.run([sys.executable, 'manage.py', 'migrate', 'assets'], check=True)
    subprocess.run([sys.executable, 'manage.py', 'migrate', 'activity'], check=True)
    subprocess.run([sys.executable, 'manage.py', 'migrate'], check=True)

    print("🎉 Database reset complete!")
    print("👉 Now run: python manage.py createsuperuser")


if __name__ == '__main__':
    reset_database()
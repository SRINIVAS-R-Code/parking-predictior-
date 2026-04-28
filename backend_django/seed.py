import os
import django
from datetime import date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from api.models import User, Parking, Space
from django.contrib.auth.hashers import make_password

def seed():
    print("Seeding database...")
    User.objects.all().delete()
    Parking.objects.all().delete()
    Space.objects.all().delete()

    owner = User.objects.create(
        email='owner@test.com',
        username='owner@test.com',
        password=make_password('testpass123'),
        name='Test Owner',
        type='owner'
    )
    
    seeker = User.objects.create(
        email='seeker@test.com',
        username='seeker@test.com',
        password=make_password('testpass123'),
        name='Test Seeker',
        type='seeker'
    )

    parking = Parking.objects.create(
        name='Mumbai Central Hub',
        address='123 Main St, Mumbai',
        city='Mumbai',
        lat='19.0760',
        long='72.8777',
        user_id=owner
    )

    Space.objects.create(
        name='A1',
        date=date.today(),
        slot_start_time='10:00am',
        slot_end_time='12:00pm',
        price=120.00,
        parking_id=parking
    )
    
    Space.objects.create(
        name='A2',
        date=date.today(),
        slot_start_time='2:00pm',
        slot_end_time='4:00pm',
        price=150.00,
        parking_id=parking
    )

    print("Database seeded successfully with 1 owner, 1 seeker, 1 parking lot, and 2 spaces.")

if __name__ == '__main__':
    seed()

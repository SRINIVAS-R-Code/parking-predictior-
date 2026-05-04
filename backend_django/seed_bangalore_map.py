import os
import django
import pandas as pd
import random
from datetime import datetime, timedelta
from django.utils.timezone import make_aware

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from api.models import Parking, Space, User

def get_admin_user():
    return User.objects.filter(type='owner').first() or User.objects.first()

# Map major bangalore areas to rough coordinates
AREA_COORDS = {
    'Koramangala': (12.9279, 77.6271),
    'Indiranagar': (12.9784, 77.6408),
    'Whitefield': (12.9698, 77.7499),
    'HSR Layout': (12.9121, 77.6446),
    'Malleswaram': (13.0031, 77.5701),
    'Electronic City': (12.8452, 77.6602),
    'Hebbal': (13.0354, 77.5988),
    'Bellandur': (12.9304, 77.6784),
    'Jayanagar': (12.9299, 77.5826),
    'MG Road': (12.9733, 77.6083),
    'Rajajinagar': (12.9982, 77.5530),
    'CV Raman Nagar': (12.9855, 77.6639),
    'Yelahanka': (13.1007, 77.5963),
    'Old Airport Road': (12.9569, 77.6543),
    'Cunningham Road': (12.9863, 77.5930),
    'Bommasandra': (12.8166, 77.6833),
    'Bannerghatta': (12.8688, 77.5950),
}

def seed_map():
    print("Clearing old parking data...")
    Parking.objects.all().delete()
    
    user = get_admin_user()
    if not user:
        print("Error: No admin user found to own the lots.")
        return

    print("Reading dataset...")
    df = pd.read_csv('smart_parking.csv')
    unique_lots = df[['lot_name', 'location_area', 'total_spaces', 'price_per_hour']].drop_duplicates('lot_name').to_dict('records')
    
    print(f"Found {len(unique_lots)} unique lots. Creating...")
    
    for lot in unique_lots:
        area = lot.get('location_area', 'MG Road')
        base_lat, base_lng = AREA_COORDS.get(area, (12.9716, 77.5946)) # Default to Bangalore center
        
        # Add slight random noise to spread markers out nicely
        lat = base_lat + random.uniform(-0.015, 0.015)
        lng = base_lng + random.uniform(-0.015, 0.015)
        
        parking = Parking.objects.create(
            user_id=user,
            name=lot['lot_name'],
            city='Bangalore',
            address=f"{area}, Bengaluru",
            lat=str(lat),
            long=str(lng)
        )
        
        # Create 10 dummy available spaces for each lot so bookings can be made!
        for i in range(1, 11):
            for h in range(8, 22): # 8 AM to 10 PM
                start_time = f"{h if h <= 12 else h-12}:00{'am' if h < 12 else 'pm'}"
                end_time = f"{h+1 if h+1 <= 12 else (h+1)-12}:00{'am' if h+1 < 12 else 'pm'}"
                
                Space.objects.create(
                    parking_id=parking,
                    name=f"Slot {chr(64 + i)}",
                    date=datetime.now().strftime("%Y-%m-%d"),
                    slot_start_time=start_time,
                    slot_end_time=end_time,
                    price=lot.get('price_per_hour', 50)
                )

    print("✅ Seeded perfectly!")

if __name__ == '__main__':
    seed_map()

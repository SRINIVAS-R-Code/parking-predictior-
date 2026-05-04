import os
import django
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from api.models import User, Parking, Space
from django.contrib.auth.hashers import make_password

# ── Bangalore lots metadata (mirrors bangalore_lots.py) ──────────────────────
LOTS = [
    {"name": "MG Road Central Park",       "area": "MG Road",         "lat": "12.9753", "long": "77.6012", "type": "Mall",        "spaces": 300},
    {"name": "Jayanagar Shopping Mall",    "area": "Jayanagar",       "lat": "12.9254", "long": "77.5828", "type": "Mall",        "spaces": 250},
    {"name": "Bannerghatta Grand Mall",    "area": "Bannerghatta",    "lat": "12.8975", "long": "77.5979", "type": "Mall",        "spaces": 400},
    {"name": "Orion Mall Rajajinagar",     "area": "Rajajinagar",     "lat": "12.9906", "long": "77.5524", "type": "Mall",        "spaces": 500},
    {"name": "Phoenix Marketcity",         "area": "Whitefield",      "lat": "12.9716", "long": "77.7493", "type": "Mall",        "spaces": 600},
    {"name": "Mantri Square Mall",         "area": "Malleswaram",     "lat": "12.9997", "long": "77.5705", "type": "Mall",        "spaces": 450},
    {"name": "Forum Koramangala",          "area": "Koramangala",     "lat": "12.9343", "long": "77.6101", "type": "Mall",        "spaces": 350},
    {"name": "Whitefield IT Hub",          "area": "Whitefield",      "lat": "12.9698", "long": "77.7500", "type": "Office",      "spaces": 500},
    {"name": "Koramangala Square",         "area": "Koramangala",     "lat": "12.9352", "long": "77.6245", "type": "Office",      "spaces": 200},
    {"name": "HSR Layout Hub",             "area": "HSR Layout",      "lat": "12.9116", "long": "77.6474", "type": "Office",      "spaces": 180},
    {"name": "Electronic City Park",       "area": "Electronic City", "lat": "12.8456", "long": "77.6603", "type": "Office",      "spaces": 600},
    {"name": "Manyata Tech Park",          "area": "Hebbal",          "lat": "13.0474", "long": "77.6190", "type": "Office",      "spaces": 800},
    {"name": "Bagmane Tech Park",          "area": "CV Raman Nagar",  "lat": "12.9760", "long": "77.6546", "type": "Office",      "spaces": 700},
    {"name": "RMZ Ecospace",               "area": "Bellandur",       "lat": "12.9270", "long": "77.6870", "type": "Office",      "spaces": 550},
    {"name": "Yelahanka Township Office",  "area": "Yelahanka",       "lat": "13.1004", "long": "77.5963", "type": "Office",      "spaces": 220},
    {"name": "Manipal Hospital Parking",   "area": "Old Airport Road","lat": "12.9591", "long": "77.6477", "type": "Hospital",    "spaces": 200},
    {"name": "Fortis Cunningham Road",     "area": "Cunningham Road", "lat": "12.9935", "long": "77.5956", "type": "Hospital",    "spaces": 150},
    {"name": "Narayana Health City",       "area": "Bommasandra",     "lat": "12.8345", "long": "77.6739", "type": "Hospital",    "spaces": 300},
    {"name": "Indiranagar Metro Park",     "area": "Indiranagar",     "lat": "12.9784", "long": "77.6408", "type": "Street",      "spaces": 120},
    {"name": "Hebbal Flyover Park",        "area": "Hebbal",          "lat": "13.0358", "long": "77.5970", "type": "Street",      "spaces": 100},
    {"name": "Marathahalli Bridge Park",   "area": "Marathahalli",    "lat": "12.9561", "long": "77.7010", "type": "Street",      "spaces": 150},
    {"name": "Yeshwanthpur Circle Park",   "area": "Yeshwanthpur",    "lat": "13.0229", "long": "77.5466", "type": "Street",      "spaces": 130},
    {"name": "Basavanagudi Street Park",   "area": "Basavanagudi",    "lat": "12.9416", "long": "77.5757", "type": "Street",      "spaces": 90},
    {"name": "Shivajinagar Bus Stand",     "area": "Shivajinagar",    "lat": "12.9858", "long": "77.6012", "type": "Street",      "spaces": 110},
    {"name": "Kempegowda Airport P1",      "area": "Devanahalli",     "lat": "13.1979", "long": "77.7063", "type": "Airport",     "spaces": 1000},
    {"name": "Kempegowda Airport P2",      "area": "Devanahalli",     "lat": "13.2002", "long": "77.7089", "type": "Airport",     "spaces": 800},
    {"name": "Majestic Bus Terminal",      "area": "Majestic",        "lat": "12.9775", "long": "77.5713", "type": "Transit",     "spaces": 200},
    {"name": "KSR Railway Station Park",   "area": "Majestic",        "lat": "12.9762", "long": "77.5699", "type": "Transit",     "spaces": 250},
    {"name": "Sarjapur Road Apts",         "area": "Sarjapur Road",   "lat": "12.9082", "long": "77.6938", "type": "Residential", "spaces": 160},
    {"name": "JP Nagar Society Park",      "area": "JP Nagar",        "lat": "12.9080", "long": "77.5835", "type": "Residential", "spaces": 140},
]

# Time slots: 6 staggered 2-hr windows per day
TIME_SLOTS = [
    ("8:00am",  "10:00am"),
    ("10:00am", "12:00pm"),
    ("12:00pm", "2:00pm"),
    ("2:00pm",  "4:00pm"),
    ("4:00pm",  "6:00pm"),
    ("6:00pm",  "8:00pm"),
]

# Slot names
SLOT_NAMES = ["A1", "A2", "B1", "B2", "C1", "C2"]

# Prices vary by lot type
PRICES = {
    "Mall":        [80, 100, 100, 120, 120, 80],
    "Office":      [50,  60,  60,  80,  80, 50],
    "Hospital":    [40,  40,  60,  60,  40, 40],
    "Street":      [30,  30,  40,  40,  30, 30],
    "Airport":     [150,150, 200, 200, 150,150],
    "Transit":     [40,  40,  60,  60,  40, 40],
    "Residential": [30,  30,  50,  50,  30, 30],
}


def seed():
    print("[SEED] Seeding database - clearing old records...")
    Space.objects.all().delete()
    Parking.objects.all().delete()
    User.objects.all().delete()

    # ── Users ────────────────────────────────────────────────────────────────
    owner = User.objects.create(
        email='owner@test.com',
        username='owner@test.com',
        password=make_password('testpass123'),
        name='Ravi Kumar',
        type='owner',
    )
    seeker = User.objects.create(
        email='seeker@test.com',
        username='seeker@test.com',
        password=make_password('testpass123'),
        name='Priya Sharma',
        type='seeker',
    )
    print("  [OK] Created users: owner@test.com / seeker@test.com  (password: testpass123)")

    # ── Parking lots + Spaces ─────────────────────────────────────────────────
    today = date.today()
    tomorrow = today + timedelta(days=1)

    total_spaces = 0
    for lot in LOTS:
        parking = Parking.objects.create(
            name=lot["name"],
            address=f"{lot['area']}, Bangalore",
            city=lot["area"],         # city = location_area so city filter works
            lat=lot["lat"],
            long=lot["long"],
            user_id=owner,
        )

        prices = PRICES.get(lot["type"], [60, 80, 80, 100, 100, 60])

        for i, ((start, end), slot_name) in enumerate(zip(TIME_SLOTS, SLOT_NAMES)):
            # Create slots for today
            Space.objects.create(
                name=slot_name,
                date=today,
                slot_start_time=start,
                slot_end_time=end,
                price=prices[i],
                parking_id=parking,
            )
            # Create slots for tomorrow too
            Space.objects.create(
                name=slot_name,
                date=tomorrow,
                slot_start_time=start,
                slot_end_time=end,
                price=prices[i],
                parking_id=parking,
            )
            total_spaces += 2

    print(f"  [OK] Created {len(LOTS)} parking lots, {total_spaces} total spaces")
    print()
    print("[DONE] Database seeded successfully!")
    print("   Login: owner@test.com  / testpass123  (owner)")
    print("   Login: seeker@test.com / testpass123  (seeker)")


if __name__ == '__main__':
    seed()

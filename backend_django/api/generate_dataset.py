"""
SmartPark Dataset Generator
============================
Generates a synthetic but realistic dataset that exactly matches
the SmartPark project's predictor.py features:
  - city
  - slot_start_time
  - price
  - space_id
  → availability_score (target variable)

Run this script once to generate:
  1. smartpark_dataset.csv         → Full training dataset (5000 rows)
  2. smartpark_training_ready.csv  → Feature-engineered ML-ready version

Usage:
  python backend_django/api/generate_dataset.py
"""

import csv
import random
import hashlib
from datetime import datetime, timedelta, date

# ── Configuration ────────────────────────────────────────────────
TOTAL_ROWS = 5000
OUTPUT_FILE = "backend_django/api/smartpark_dataset.csv"
ML_READY_FILE = "backend_django/api/smartpark_training_ready.csv"

# Indian cities used in the project (matches predictor.py busy_cities logic)
CITIES = {
    "Mumbai":    {"tier": "busy", "lat": 19.0760, "long": 72.8777},
    "Delhi":     {"tier": "busy", "lat": 28.7041, "long": 77.1025},
    "Bengaluru": {"tier": "busy", "lat": 12.9716, "long": 77.5946},
    "Hyderabad": {"tier": "medium", "lat": 17.3850, "long": 78.4867},
    "Chennai":   {"tier": "medium", "lat": 13.0827, "long": 80.2707},
    "Pune":      {"tier": "medium", "lat": 18.5204, "long": 73.8567},
    "Kolkata":   {"tier": "medium", "lat": 22.5726, "long": 88.3639},
    "Ahmedabad": {"tier": "low",    "lat": 23.0225, "long": 72.5714},
    "Jaipur":    {"tier": "low",    "lat": 26.9124, "long": 75.7873},
    "Surat":     {"tier": "low",    "lat": 21.1702, "long": 72.8311},
}

# Time slots matching your Space model format (slot_start_time field)
TIME_SLOTS = [
    "6:00am",  "7:00am",  "8:00am",  "9:00am",  "10:00am",
    "11:00am", "12:00pm", "1:00pm",  "2:00pm",  "3:00pm",
    "4:00pm",  "5:00pm",  "6:00pm",  "7:00pm",  "8:00pm",
    "9:00pm",  "10:00pm",
]

TIME_END_MAP = {
    "6:00am": "8:00am",   "7:00am": "9:00am",   "8:00am": "10:00am",
    "9:00am": "11:00am",  "10:00am": "12:00pm",  "11:00am": "1:00pm",
    "12:00pm": "2:00pm",  "1:00pm": "3:00pm",    "2:00pm": "4:00pm",
    "3:00pm": "5:00pm",   "4:00pm": "6:00pm",    "5:00pm": "7:00pm",
    "6:00pm": "8:00pm",   "7:00pm": "9:00pm",    "8:00pm": "10:00pm",
    "9:00pm": "11:00pm",  "10:00pm": "12:00am",
}

# Price ranges in INR (matching your Space model's price field)
PRICE_RANGES = {
    "busy":   (80, 300),
    "medium": (50, 180),
    "low":    (20, 100),
}

# Parking lot names per city
PARKING_NAMES = {
    "Mumbai":    ["Andheri West Parking", "BKC Parking Hub", "Dadar Central Park", "Bandra Parking Zone", "Kurla Lot A"],
    "Delhi":     ["Connaught Place Parking", "Saket Parking", "Dwarka Sector 10 Lot", "Karol Bagh Park", "Lajpat Nagar P1"],
    "Bengaluru": ["Koramangala Level 1", "Indiranagar Parking Hub", "Whitefield Park Zone", "MG Road Parking", "HSR Layout Lot"],
    "Hyderabad": ["Hitech City Parking", "Banjara Hills Lot A", "Secunderabad Hub", "Jubilee Hills Park", "Madhapur Lot 2"],
    "Chennai":   ["T Nagar Parking Zone", "Anna Nagar Hub", "Adyar Lot 1", "Velachery Park", "Nungambakkam Lot"],
    "Pune":      ["Koregaon Park Lot", "Kothrud Hub", "Hinjewadi IT Park", "Camp Area Parking", "Aundh Lot A"],
    "Kolkata":   ["Park Street Parking", "Salt Lake Hub", "Rajarhat Lot 2", "Howrah Bridge Lot", "New Town Park"],
    "Ahmedabad": ["SG Highway Lot", "CG Road Parking", "Prahlad Nagar Hub", "Navrangpura Lot", "Maninagar Park"],
    "Jaipur":    ["Pink City Lot A", "Vaishali Nagar Park", "Malviya Nagar Hub", "Mansarovar Lot", "C-Scheme Parking"],
    "Surat":     ["Ring Road Lot A", "Athwa Gate Park", "Vesu Parking Hub", "Adajan Lot 2", "Udhna Lot A"],
}

# ── Core Predictor Logic (matches predictor.py exactly) ──────────
def compute_availability(city, slot_time, price, space_id, date_str):
    prob = 85.0

    # 1. City factor
    busy_cities = ['Mumbai', 'Delhi', 'Bengaluru', 'Bangalore']
    if any(m.lower() in str(city).lower() for m in busy_cities):
        prob -= 15.0
    else:
        prob -= 5.0

    # 2. Time factor
    time_str = str(slot_time).lower()
    rush_hours = ['9:00am', '10:00am', '5:00pm', '6:00pm', '7:00pm']
    mid_day    = ['12:00pm', '1:00pm', '2:00pm', '3:00pm', '4:00pm']

    if any(h in time_str for h in rush_hours):
        prob -= 25.0
    elif any(h in time_str for h in mid_day):
        prob -= 10.0
    else:
        prob += 10.0

    # 3. Price factor
    price_val = float(price)
    if price_val > 150:
        prob += 15.0
    elif price_val < 50:
        prob -= 10.0

    # 4. Deterministic noise (same as predictor.py)
    hash_str = f"{space_id}_{date_str}"
    random_variance = int(hashlib.md5(hash_str.encode()).hexdigest(), 16) % 20
    prob = prob + (random_variance - 10)

    # 5. Extra real-world noise per row
    prob += random.uniform(-5, 5)

    return round(max(5.0, min(98.0, prob)))

# ── Helper: hour integer from time string ────────────────────────
def time_to_hour(t):
    t = t.lower().strip()
    if 'am' in t:
        h = int(t.replace(':00am', '').replace('am', ''))
        return 0 if h == 12 else h
    else:
        h = int(t.replace(':00pm', '').replace('pm', ''))
        return h if h == 12 else h + 12

def is_rush_hour(t):
    rush = ['9:00am', '10:00am', '5:00pm', '6:00pm', '7:00pm']
    return 1 if any(r in t.lower() for r in rush) else 0

def is_midday(t):
    mid = ['12:00pm', '1:00pm', '2:00pm', '3:00pm', '4:00pm']
    return 1 if any(m in t.lower() for m in mid) else 0

def city_tier_num(city):
    tier = CITIES[city]["tier"]
    return {"busy": 2, "medium": 1, "low": 0}[tier]

# ── Generate Dates (last 6 months) ───────────────────────────────
def random_date():
    start = date(2025, 10, 1)
    end   = date(2026, 4, 19)
    delta = (end - start).days
    return start + timedelta(days=random.randint(0, delta))

# ── Main Generation ──────────────────────────────────────────────
def generate():
    random.seed(42)  # Reproducible

    rows = []
    space_counter = 1

    for city_name, city_info in CITIES.items():
        rows_per_city = TOTAL_ROWS // len(CITIES)
        parking_lots = PARKING_NAMES[city_name]
        tier = city_info["tier"]
        price_min, price_max = PRICE_RANGES[tier]

        for i in range(rows_per_city):
            parking_name = random.choice(parking_lots)
            parking_id   = f"P{list(CITIES.keys()).index(city_name)+1:02d}{parking_lots.index(parking_name)+1:02d}"
            space_id     = f"SP{space_counter:04d}"
            slot_start   = random.choice(TIME_SLOTS)
            slot_end     = TIME_END_MAP[slot_start]
            price        = round(random.uniform(price_min, price_max), 2)
            booking_date = random_date()
            date_str     = booking_date.strftime("%Y-%m-%d")
            day_of_week  = booking_date.weekday()  # 0=Mon, 6=Sun
            is_weekend   = 1 if day_of_week >= 5 else 0

            availability = compute_availability(
                city_name, slot_start, price, space_id, date_str
            )

            rows.append({
                # ── Raw columns (match your Django models exactly) ──
                "space_id":        space_id,
                "parking_id":      parking_id,
                "parking_name":    parking_name,
                "city":            city_name,
                "lat":             city_info["lat"],
                "long":            city_info["long"],
                "date":            date_str,
                "slot_start_time": slot_start,
                "slot_end_time":   slot_end,
                "price":           price,
                # ── Target variable ──
                "availability_score": availability,
                # ── Derived labels ──
                "is_available":    1 if availability >= 50 else 0,
                "availability_label": (
                    "High" if availability >= 70
                    else "Medium" if availability >= 40
                    else "Low"
                ),
                # ── Extra context ──
                "day_of_week":  day_of_week,
                "is_weekend":   is_weekend,
            })

            space_counter += 1

    # Write raw dataset
    fieldnames = list(rows[0].keys())
    with open(OUTPUT_FILE, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"[OK] Raw dataset saved -> {OUTPUT_FILE}  ({len(rows)} rows)")

    # Write ML-ready version (numeric features only)
    ml_rows = []
    for r in rows:
        ml_rows.append({
            "city_tier":            city_tier_num(r["city"]),
            "hour":                 time_to_hour(r["slot_start_time"]),
            "is_rush_hour":         is_rush_hour(r["slot_start_time"]),
            "is_midday":            is_midday(r["slot_start_time"]),
            "price":                r["price"],
            "is_weekend":           r["is_weekend"],
            "day_of_week":          r["day_of_week"],
            "availability_score":   r["availability_score"],   # ← TARGET
            "is_available":         r["is_available"],          # ← BINARY TARGET
        })

    ml_fields = list(ml_rows[0].keys())
    with open(ML_READY_FILE, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=ml_fields)
        writer.writeheader()
        writer.writerows(ml_rows)
    print(f"[OK] ML-ready dataset saved -> {ML_READY_FILE}  ({len(ml_rows)} rows)")

    # Print summary
    print("\n[SUMMARY] Dataset Summary:")
    print(f"   Total rows       : {len(rows)}")
    print(f"   Cities covered   : {', '.join(CITIES.keys())}")
    print(f"   Time slots       : {len(TIME_SLOTS)} slots (6am–10pm)")
    print(f"   Price range      : ₹20 – ₹300")
    print(f"   Date range       : Oct 2025 – Apr 2026")
    print(f"   Target variable  : availability_score (5–98%)")
    print(f"\n[FEATURES] ML Features in smartpark_training_ready.csv:")
    print(f"   city_tier      → 0=low, 1=medium, 2=busy")
    print(f"   hour           → 0–23")
    print(f"   is_rush_hour   → 0 or 1")
    print(f"   is_midday      → 0 or 1")
    print(f"   price          → float (INR)")
    print(f"   is_weekend     → 0 or 1")
    print(f"   day_of_week    → 0=Mon ... 6=Sun")
    print(f"   availability_score → 5–98  ← REGRESSION TARGET")
    print(f"   is_available       → 0/1   ← CLASSIFICATION TARGET")

if __name__ == "__main__":
    generate()

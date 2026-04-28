import os
import joblib
from datetime import datetime
import pandas as pd
import hashlib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'parking_model.pkl')
ENCODERS_PATH = os.path.join(BASE_DIR, 'encoders.pkl')

_model = None
_encoders = None

def get_model():
    global _model, _encoders
    if _model is None or _encoders is None:
        try:
            _model = joblib.load(MODEL_PATH)
            _encoders = joblib.load(ENCODERS_PATH)
        except Exception as e:
            print(f"Error loading model/encoders: {e}")
    return _model, _encoders

def time_to_hour(t):
    t = str(t).lower().strip()
    if not t: return 12
    if 'am' in t:
        try:
            h = int(t.replace(':00am', '').replace('am', ''))
            return 0 if h == 12 else h
        except: return 12
    elif 'pm' in t:
        try:
            h = int(t.replace(':00pm', '').replace('pm', ''))
            return h if h == 12 else h + 12
        except: return 12
    return 12

def deterministic_zone(city_name, encoders):
    """Deterministically map a city to a valid zone using hashing."""
    if encoders is None or 'zone' not in encoders:
        return 0
    zones = encoders['zone'].classes_
    city_str = str(city_name).lower().strip()
    idx = int(hashlib.md5(city_str.encode()).hexdigest(), 16) % len(zones)
    return idx

def predict_availability(city, slot_time, price, space_id=None):
    """
    Predicts availability using the Random Forest trained on smart_parking_usage_occupancy_analytics.
    Features: ['zone', 'hour', 'day_of_week', 'is_weekend', 'total_slots', 'vehicle_type', 'parking_fee_collected']
    """
    model, encoders = get_model()

    if model is None or encoders is None:
        return 50  # Fallback
        
    today = datetime.now()
    day_of_week = today.weekday()
    is_weekend = 1 if day_of_week >= 5 else 0
    hour = time_to_hour(slot_time)
    
    try:
        price_val = float(price)
    except:
        price_val = 50.0
        
    # Map API params to model features
    zone_val = deterministic_zone(city, encoders)
    
    total_slots = 100
    if encoders is not None and 'vehicle_type' in encoders and 'Car' in encoders['vehicle_type'].classes_:
        vehicle_type_val = list(encoders['vehicle_type'].classes_).index('Car')
    else:
        vehicle_type_val = 0
    
    features = {
        'zone': [zone_val],
        'hour': [hour],
        'day_of_week': [day_of_week],
        'is_weekend': [is_weekend],
        'total_slots': [total_slots],
        'vehicle_type': [vehicle_type_val],
        'parking_fee_collected': [price_val]
    }
    
    X = pd.DataFrame(features)
    predicted_occupancy = model.predict(X)[0]
    
    # Availability is inversely proportional to occupancy
    availability = 100.0 - predicted_occupancy
    
    return round(max(5.0, min(98.0, availability)))


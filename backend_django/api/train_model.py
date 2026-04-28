import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(BASE_DIR)) # e:\pakring  prediction
DATASET_PATH = os.path.join(PROJECT_ROOT, 'smart_parking_usage_occupancy_analytics.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'parking_model.pkl')
ENCODERS_PATH = os.path.join(BASE_DIR, 'encoders.pkl')

def train():
    if not os.path.exists(DATASET_PATH):
        print(f"Error: Dataset not found at {DATASET_PATH}")
        return

    print("Loading dataset...")
    df = pd.read_csv(DATASET_PATH)

    # Feature Engineering
    print("Engineering features...")
    # 1. Datetime extraction
    df['date_time'] = pd.to_datetime(df['date_time'])
    df['hour'] = df['date_time'].dt.hour
    df['day_of_week'] = df['date_time'].dt.dayofweek
    df['is_weekend'] = df['day_of_week'].apply(lambda x: 1 if x >= 5 else 0)

    # 2. Label Encoding categorical variables
    encoders = {}
    for col in ['zone', 'vehicle_type']:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        encoders[col] = le
    
    # Target and Features
    features = ['zone', 'hour', 'day_of_week', 'is_weekend', 'total_slots', 'vehicle_type', 'parking_fee_collected']
    target = 'occupancy_rate_percent'

    # Filter out nulls
    df = df.dropna(subset=features + [target])

    X = df[features]
    y = df[target]

    print(f"Dataset shape: {df.shape}")
    print("Splitting dataset...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training RandomForestRegressor model...")
    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    print("Evaluating model...")
    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)

    print(f"Model Mean Absolute Error: {mae:.2f}")
    print(f"Model R^2 Score: {r2:.4f}")

    print(f"Saving model and encoders to {BASE_DIR}...")
    joblib.dump(model, MODEL_PATH)
    joblib.dump(encoders, ENCODERS_PATH)
    print("Training complete and model saved successfully!")

if __name__ == "__main__":
    train()

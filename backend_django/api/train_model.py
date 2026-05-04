"""
Train the Random Forest model for parking availability prediction
File: backend_django/api/train_model.py

Run once with:
  cd backend_django
  python api/train_model.py
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib
import os

# ── Locate CSV (one level above backend_django/) ─────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # backend_django/
REPO_DIR = os.path.dirname(BASE_DIR)                                    # project root
CSV_PATH = os.path.join(REPO_DIR, 'smart_parking_bengaluru_600k.csv')

print(f"Loading dataset from: {CSV_PATH}")
df = pd.read_csv(CSV_PATH)

print(f"Dataset shape: {df.shape}")
print(f"Columns: {df.columns.tolist()}")
print(f"Unique lots: {df['lot_name'].nunique()}")

# ── Target & features ────────────────────────────────────────────────────────
TARGET = 'availability_label'

FEATURES_TO_DROP = [
    'record_id', 'lot_id', 'lot_name', 'location_area', 'date', 'availability_label',
    'available_spaces',   # present in 600k dataset, derived column — drop to avoid data leakage
]
# Only drop columns that actually exist
FEATURES_TO_DROP = [c for c in FEATURES_TO_DROP if c in df.columns]

print("\nPreparing data...")

df_processed = df.copy()

categorical_columns = ['lot_type', 'day_of_week', 'month', 'season', 'weather_condition']

label_encoders = {}
for col in categorical_columns:
    le = LabelEncoder()
    df_processed[col] = le.fit_transform(df_processed[col])
    label_encoders[col] = le
    print(f"  Encoded {col}: {dict(zip(le.classes_, le.transform(le.classes_)))}")

X = df_processed.drop(columns=FEATURES_TO_DROP)
y = df_processed[TARGET]

# Binary target: High=1, Low/Medium=0
y_binary = (y == 'High').astype(int)

print(f"\nFeatures: {X.shape}  |  Target distribution:")
print(y_binary.value_counts())

X_train, X_test, y_train, y_test = train_test_split(
    X, y_binary, test_size=0.2, random_state=42
)

print(f"\nTrain: {X_train.shape[0]} rows  |  Test: {X_test.shape[0]} rows")

# ── Train ────────────────────────────────────────────────────────────────────
print("\nTraining Random Forest model (this may take ~1-2 min)...")
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=15,
    min_samples_split=10,
    min_samples_leaf=5,
    random_state=42,
    n_jobs=-1,
    verbose=1
)
model.fit(X_train, y_train)

# ── Evaluate ─────────────────────────────────────────────────────────────────
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"\n[OK] Model Accuracy: {accuracy:.4f} ({accuracy*100:.1f}%)")
print("\nClassification Report:")
print(classification_report(y_test, y_pred))
print("Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))

feature_importance = pd.DataFrame({
    'feature': X.columns,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

print("\nTop 10 Important Features:")
print(feature_importance.head(10))

# -- Save to api/ directory (where predictor.py loads from) -------------------
SAVE_DIR = os.path.dirname(os.path.abspath(__file__))   # backend_django/api/

print(f"\nSaving model to: {SAVE_DIR}")
joblib.dump(model,              os.path.join(SAVE_DIR, 'parking_model.pkl'))
joblib.dump(label_encoders,     os.path.join(SAVE_DIR, 'encoders.pkl'))
joblib.dump(X.columns.tolist(), os.path.join(SAVE_DIR, 'feature_columns.pkl'))

print("[OK] parking_model.pkl  saved")
print("[OK] encoders.pkl       saved")
print("[OK] feature_columns.pkl saved")
print("\nDone! Model is ready for predictions.")

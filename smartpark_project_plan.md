# COMPLETE PROJECT PLAN
# SMART PARKING AVAILABILITY PREDICTOR (SMARTPARK)
### Built for Bengaluru Traffic & Parking Infrastructure
**Team Size:** 4 Members
**Duration:** 5 Weeks
**Tech Stack:** Python + React + Django REST Framework + Random Forest

## What this document covers:
* Complete folder & file structure
* Environment setup — every command
* Target 90%+ Accuracy Prediction Model
* ML model — step by step methodology
* Django backend — full implementation guide
* React frontend — complete UI and Map integration
* Testing strategy & test cases
* Team task assignments

---

# TABLE OF CONTENTS
1. Project Overview & Problem Statement
2. System Architecture — Full Diagram
3. Tech Stack — Every Tool Explained
4. Complete Folder & File Structure
5. PHASE 1 — Environment Setup
6. PHASE 2 — Dataset & Data Preparation
7. PHASE 3 — Machine Learning Model (Random Forest)
8. PHASE 4 — Django REST Backend
9. PHASE 5 — React & Leaflet Frontend
10. PHASE 6 — Integration & Testing
11. PHASE 7 — Deployment Strategy
12. Documentation & Presentation
13. Team Task Assignments
14. Common Errors & How to Fix Them

---

# 1. PROJECT OVERVIEW & PROBLEM STATEMENT

### What Are We Building?
We are building **SmartPark**, an AI-powered smart parking solution tailored specifically for Bengaluru. The system uses Machine Learning (Random Forest) to predict the real-time availability of parking spaces across 30 major city nodes (e.g., MG Road, Whitefield, Malls, Tech Parks). Users can view an interactive map, get an AI-generated "Availability Score" based on current conditions, and seamlessly book spots. 

### The Problem In Numbers
| The Problem | Scale & Impact |
| :--- | :--- |
| **Urban Congestion** | Drivers in Bangalore waste significant time circling for parking in high-density areas. |
| **Fuel & Emissions** | Cruising for parking contributes to massive fuel wastage and increased carbon emissions. |
| **Static Data** | Current mapping tools show *where* parking is, but not *if it is available right now*. |
| **Lack of Digitization** | Unorganized parking sectors lead to revenue leakage for owners. |

### What Our System Does — The User Flow
| User Type | What They Do | What System Does |
| :--- | :--- | :--- |
| **Seeker** | Opens Map, clicks a node, inputs time | AI returns an "Availability Probability" score. Allows booking. |
| **Owner** | Logs into dashboard | Manages spots, views incoming bookings, updates capacity. |

---

# 2. SYSTEM ARCHITECTURE — HOW EVERYTHING CONNECTS

The architecture relies on a decoupled Full-Stack approach, linked via REST APIs.

**LAYER 1: USER INTERFACE (Frontend)**
* React web app with a Leaflet.js interactive map.
* Users interact with map markers to request data.

**LAYER 2: API GATEWAY (Django Backend)**
* Django REST Framework (DRF) receives the request.
* Validates JWT authentication and routes to the ML Predictor.

**LAYER 3: AI PREDICTOR (Machine Learning)**
* The pre-trained Random Forest model (`.pkl` file) is loaded into memory.
* It analyzes inputs: `Location`, `Time of Day`, `Day of Week`, `Weather`, `Lot Type`.

**LAYER 4: DATABASE & BOOKING (SQLite)**
* If the user decides to book based on the AI prediction, the backend reserves the spot in the SQLite Database and returns a confirmation to the frontend.

---

# 3. COMPLETE TECH STACK — EVERY TOOL EXPLAINED

| Layer | Tool / Library | Why We Use It |
| :--- | :--- | :--- |
| **ML** | scikit-learn | To build and train the Random Forest Classifier. |
| **ML** | pandas & numpy | For data manipulation of the 600,000 row dataset. |
| **ML** | joblib | To serialize and save the trained model for the backend. |
| **Backend** | Django (v4.2) | Secure, scalable Python web framework. Perfect for integrating Python-based ML. |
| **Backend** | Django REST Framework | To build the API endpoints that React will communicate with. |
| **Backend** | SQLite | Lightweight database, perfect for local development and seamless project demonstrations. |
| **Backend** | PyJWT | For secure, stateless user authentication (Login/Register). |
| **Frontend** | React (v18) | Component-based UI framework for a smooth Single Page Application experience. |
| **Frontend** | Leaflet.js | Open-source interactive mapping library. Lighter than Google Maps. |
| **Frontend** | Redux Toolkit | Global state management (keeping track of user sessions and bookings). |
| **Frontend** | Vanilla CSS | Custom Glassmorphism design system for a premium UI. |

---

# 4. COMPLETE FOLDER & FILE STRUCTURE

```text
smartpark-predictor/
│
├── backend_django/             ← Django API Backend & ML Pipeline
│   ├── manage.py               ← Django entry point
│   ├── core/                   ← Django project settings
│   ├── api/                    ← Main Django App (Endpoints)
│   │   ├── models.py           ← Database schema (Users, Bookings, Spaces)
│   │   ├── views.py            ← API logic and ML inference routing
│   │   ├── urls.py             ← API routing
│   │   ├── train_model.py      ← Script to train the ML model
│   │   ├── predictor.py        ← Script to load model and run predictions
│   │   └── parking_model.pkl   ← Saved Random Forest Model
│   └── requirements.txt        ← Python dependencies
│
├── Frontend/                   ← React Web Application
│   ├── package.json            ← Node dependencies
│   ├── public/                 ← Static assets
│   └── src/
│       ├── App.js              ← Main React routing
│       ├── index.css           ← Global styles & Glassmorphism variables
│       ├── components/         ← Reusable UI (Navbar, MapMarker, Modals)
│       ├── pages/              ← Full Pages (ParkingPredictor, Login, Space)
│       └── store/              ← Redux Toolkit configuration
│
└── dataset/                    ← Raw Data
    └── bangalore_parking_600k.csv 
```

### How to Create This Structure — Commands:
```bash
# Run these commands in your terminal (one by one)
mkdir smartpark-predictor
cd smartpark-predictor

# Backend Structure
mkdir backend_django
mkdir backend_django/core backend_django/api
touch backend_django/manage.py backend_django/requirements.txt
touch backend_django/api/models.py backend_django/api/views.py backend_django/api/urls.py
touch backend_django/api/train_model.py backend_django/api/predictor.py

# Frontend Structure
mkdir Frontend
mkdir Frontend/public Frontend/src
mkdir Frontend/src/components Frontend/src/pages Frontend/src/store
touch Frontend/package.json
touch Frontend/src/App.js Frontend/src/index.css

# Dataset Folder
mkdir dataset
```

---

# 5. PHASE 1 — ENVIRONMENT SETUP

### Step 1.1 — Install Required Software
1. **Python 3.10+**: Download from python.org
2. **Node.js 18+**: Download from nodejs.org
3. **Git & VS Code**: For version control and code editing.

### Step 1.2 — Create Python Virtual Environment
```bash
cd smartpark-predictor/backend_django
python -m venv venv

# Activate (Windows):
venv\Scripts\activate

# Activate (Mac/Linux):
source venv/bin/activate
```

### Step 1.3 — Install Dependencies
Create `requirements.txt`:
```txt
Django==4.2.0
djangorestframework==3.14.0
django-cors-headers==4.2.0
PyJWT==2.8.0
scikit-learn==1.3.0
pandas==2.0.3
numpy==1.24.3
joblib==1.3.2
```
Run: `pip install -r requirements.txt`

### Step 1.4 — Frontend Setup
```bash
cd ../Frontend
npm install
npm install react-leaflet leaflet @reduxjs/toolkit react-redux axios react-router-dom
```

---

# 6. PHASE 2 — DATASET & DATA PREPARATION

We utilize a custom dataset representing Bengaluru traffic and parking behaviors, containing over 600,000 records.

### Key Features (Columns):
* `location_id`: Identifier for the 30 canonical nodes (e.g., MG Road).
* `lot_type`: Categorical (Mall, Office, Hospital, Airport, Street).
* `hour_slot`: 0-23 representing the time of day.
* `day_of_week`: 0-6 (Monday-Sunday).
* `weather_condition`: Clear, Rain, Fog.
* **TARGET**: `availability_status` (High, Medium, Low / Occupied).

### Data Preprocessing Strategy:
1. **Handle Missing Values**: Drop incomplete records.
2. **Encode Categorical Variables**: Convert `lot_type` and `weather_condition` into numerical formats using One-Hot Encoding or Label Encoding.
3. **Train/Test Split**: 80% for training the model, 20% for testing its accuracy.

---

# 7. PHASE 3 — MACHINE LEARNING MODEL (RANDOM FOREST)

We chose **Random Forest** because parking availability is non-linear. Complex patterns exist (e.g., Offices are full at 10 AM on weekdays, but empty at 10 AM on Sundays). Decision trees handle these conditions exceptionally well.

### Training the Model (`backend_django/api/train_model.py`)
```python
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib

# 1. Load Data
df = pd.read_csv('../../dataset/bangalore_parking_600k.csv')

# 2. Features and Target
X = df[['location_id', 'lot_type', 'hour_slot', 'day_of_week', 'weather_condition']]
y = df['availability_status']

# 3. Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Train Model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 5. Evaluate
print(f"Accuracy: {model.score(X_test, y_test)}")

# 6. Save Model
joblib.dump(model, 'parking_model.pkl')
print("Model Saved Successfully!")
```

---

# 8. PHASE 4 — DJANGO REST BACKEND

### Django Endpoints Needed:
1. **`/api/auth/login/`**: JWT generation.
2. **`/api/parking-nodes/`**: Returns all 30 map locations.
3. **`/api/predict/`**: Accepts time/weather, feeds it to `.pkl` model, returns score.
4. **`/api/book/`**: Creates a reservation in the SQLite DB.

### Inference Logic (`predictor.py`)
```python
import joblib

model = joblib.load('api/parking_model.pkl')

def get_prediction(location_id, lot_type, hour, day, weather):
    # Format input to match training data
    input_data = [[location_id, lot_type, hour, day, weather]]
    prediction = model.predict(input_data)
    probabilities = model.predict_proba(input_data)
    
    return {
        "status": prediction[0],
        "confidence": max(probabilities[0]) * 100
    }
```

---

# 9. PHASE 5 — REACT FRONTEND

### Key UI Components:
1. **Interactive Leaflet Map**: Displays markers over Bengaluru.
2. **Marker Clustering**: Groups markers in dense areas to prevent UI clutter.
3. **Prediction Dashboard**: A sleek, Glassmorphism-styled sidebar where users input their desired arrival time and see the AI output.
4. **Booking Modal**: Appears when a user selects a predicted spot to finalize their reservation.

### API Integration (Axios)
```javascript
import axios from 'axios';

const getPrediction = async (data) => {
    try {
        const response = await axios.post('http://localhost:8000/api/predict/', data);
        return response.data; // Returns { status: "High", confidence: 85.5 }
    } catch (error) {
        console.error("Prediction failed", error);
    }
}
```

---

# 10. PHASE 6 — INTEGRATION & TESTING

### System Testing Checklist:
* [ ] **Backend Runs**: `python manage.py runserver` starts without errors.
* [ ] **Frontend Runs**: `npm start` loads the React app on port 3000.
* [ ] **Database Seeded**: The 30 Bengaluru nodes exist in the SQLite DB.
* [ ] **Map Renders**: Leaflet map loads centered on Bengaluru.
* [ ] **AI Works**: Clicking a marker and clicking "Predict" returns an AI score via Django.
* [ ] **Booking Flow**: A seeker can complete a booking and the owner dashboard updates.

### Test Cases
| Test ID | Action | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- |
| TC-01 | Predict Office Lot at 10 AM, Monday | Status: LOW, Confidence > 80% | |
| TC-02 | Predict Office Lot at 10 AM, Sunday | Status: HIGH, Confidence > 80% | |
| TC-03 | Attempt Booking without Login | Redirect to Login Page | |
| TC-04 | Map Zoom Out | Markers group together (Clustering works) | |

---

# 11. PHASE 7 — DEPLOYMENT STRATEGY (Optional)

If deploying for the final presentation:
1. **Backend**: Render.com (Free Tier)
   * Connect GitHub repo, run `pip install -r requirements.txt`.
   * Start command: `gunicorn core.wsgi`.
2. **Frontend**: Vercel (Free Tier)
   * Connect GitHub repo, set build command to `npm run build`.
   * Ensure `REACT_APP_API_URL` environment variable points to the Render backend URL.

---

# 12. DOCUMENTATION & PRESENTATION

### Presentation (PPT) Structure — 10 Slides
1. **Title Slide**: SmartPark Bengaluru
2. **Problem Statement**: Urban traffic congestion caused by parking hunts.
3. **Our Solution**: AI Predictive Map & Direct Booking.
4. **System Architecture**: React -> Django -> Random Forest.
5. **Machine Learning Approach**: Why Random Forest? (600k rows, tabular data).
6. **Feature Engineering**: Explaining Location, Time, Weather impacts.
7. **The Frontend**: Custom UI, Leaflet Map integration.
8. **Live Demo**: Show the Map, run a Prediction, book a spot.
9. **Future Scope**: Integration with actual IoT sensors, dynamic pricing.
10. **Team Contributions**: Who built what.

---

# 13. TEAM TASK ASSIGNMENTS

**P1 — ML Engineer / Data Scientist**
* Handle the 600k dataset.
* Write preprocessing scripts and feature engineering.
* Train the Random Forest model and export `.pkl`.
* Evaluate accuracy and write the ML report.

**P2 — Backend Developer (Django)**
* Setup Django and DRF.
* Build Authentication flow (JWT).
* Create endpoints for Map Nodes and Bookings.
* Integrate the ML model (`predictor.py`) into the views.

**P3 — Frontend Developer (React & UI)**
* Setup React, Redux, and custom CSS styling.
* Build the Login, Dashboard, and Prediction forms.
* Ensure responsive design.

**P4 — Frontend Developer (Mapping Integration)**
* Setup Leaflet.js.
* Plot Bengaluru coordinates.
* Implement Marker Clustering.
* Connect the map clicks to the Redux store so P3's prediction form works.

---

# 14. COMMON ERRORS & HOW TO FIX THEM

* **Error: React CORS Policy Blocked**
  * **Fix**: Ensure `django-cors-headers` is installed and `CORS_ALLOW_ALL_ORIGINS = True` is set in Django `settings.py` (for local dev).
* **Error: `parking_model.pkl` not found.**
  * **Fix**: You must run `python train_model.py` first to generate the file before starting the Django server.
* **Error: Map loads as grey boxes.**
  * **Fix**: Ensure the Leaflet CSS file is imported in `index.html` or `App.js` (`import 'leaflet/dist/leaflet.css';`).
* **Error: "ModuleNotFoundError: No module named 'sklearn'" in Django.**
  * **Fix**: Ensure you have activated your virtual environment before running the server, and that scikit-learn is installed.

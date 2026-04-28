# SmartPark — Automated Real-Time Parking Management for Smart Cities

> **HACKAZARDS 2026 Project Submission**
> 🎯 [View Presentation](https://www.canva.com/design/DAF-psP3_jI/pO-WvED9iEe5Wrc72LmbEQ/view?utm_content=DAF-psP3_jI&utm_campaign=designshare&utm_medium=link&utm_source=editor)

Imagine a city where finding a parking spot is effortless, where traffic congestion is minimized, and where you can seamlessly navigate urban mobility. That's the vision behind **SmartPark** — India's premier AI-powered smart parking solution.

SmartPark is not just about convenience; it's about sustainability. We're committed to reducing traffic congestion and air pollution, aligning with India's smart city initiatives.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Availability Prediction** | RandomForest ML model predicts real-time parking availability with 94.8% accuracy |
| 📍 **Live Satellite Map** | Interactive Leaflet.js map with color-coded availability markers across 40+ Indian cities |
| 📅 **Parking Reservation** | Instant spot booking with owner approval workflow |
| 💰 **Dynamic Pricing** | Owners set prices; AI-ranked availability helps seekers choose best value |
| 📊 **Owner Analytics** | Revenue, occupancy, and booking dashboards for parking owners |
| 🔐 **JWT Authentication** | Secure login with role-based access (Admin / Owner / Seeker) |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **ML Engine** | Python · scikit-learn · RandomForestRegressor |
| **Backend** | Django 4.2 · Django REST Framework |
| **Auth** | djangorestframework-simplejwt (JWT Bearer tokens) |
| **Frontend** | React.js · Redux · Redux-Persist |
| **Map** | Leaflet.js · ESRI Satellite tiles |
| **Styling** | Vanilla CSS · Inter & Space Grotesk fonts |
| **Database** | SQLite (dev) · PostgreSQL (prod) |
| **CORS** | django-cors-headers |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- pip

### 1. Clone the repository
```bash
git clone https://github.com/SRINIVAS-R-Code/parking-predictior-.git
cd parking-predictior-
```

### 2. Set up Python virtual environment & install dependencies
```bash
python -m venv venv
venv\Scripts\activate          # Windows
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers scikit-learn pandas joblib
```

### 3. Run the Django backend
```bash
cd backend_django
python manage.py migrate
python seed.py                 # (Optional) seed sample parking data
python manage.py runserver     # → http://127.0.0.1:8000
```

### 4. Run the React frontend
```bash
cd Frontend
npm install
npm start                      # → http://localhost:3000
```

---

## 🗂 Project Structure

```
parking-predictior-/
├── backend_django/            # Django backend
│   ├── api/
│   │   ├── models.py          # User, Parking, Space, Booking, Review
│   │   ├── views.py           # REST API ViewSets
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   ├── predictor.py       # 🤖 ML prediction engine
│   │   ├── train_model.py     # RandomForest training script
│   │   └── parking_model.pkl  # Pre-trained model
│   └── backend_django/        # Django settings & URLs
├── Frontend/                  # React frontend
│   └── src/
│       ├── pages/             # Home, Parking (Map), Space, Booking, etc.
│       ├── api/api.js         # Axios API calls
│       ├── reducers/          # Redux user state
│       └── css/global.css     # Full design system
├── smart_parking_usage_occupancy_analytics.csv   # Training dataset
└── README.md
```

---

## 👤 Author

**Srinivas R**
- GitHub: [@SRINIVAS-R-Code](https://github.com/SRINIVAS-R-Code)

---

## 📄 License

ISC © 2026 Srinivas R

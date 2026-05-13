# SmartPark — Bangalore Parking Availability Predictor

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Netlify-00C7B7?style=for-the-badge&logo=netlify)](https://gorgeous-pegasus-b6f730.netlify.app)
[![Backend API](https://img.shields.io/badge/⚙️%20Backend%20API-Render-46E3B7?style=for-the-badge&logo=render)](https://parking-predictior.onrender.com/parking)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/SRINIVAS-R-Code/parking-predictior-)

## 🌐 Live Links

| Service | URL |
|---|---|
| 🌍 **Frontend (Live Site)** | [https://gorgeous-pegasus-b6f730.netlify.app](https://gorgeous-pegasus-b6f730.netlify.app) |
| ⚙️ **Backend API** | [https://parking-predictior.onrender.com/parking](https://parking-predictior.onrender.com/parking) |
| 🗺️ **Bangalore ML Lots** | [https://parking-predictior.onrender.com/api/bangalore-lots/?hour=10](https://parking-predictior.onrender.com/api/bangalore-lots/?hour=10) |

> 💡 First load may take **30-60 seconds** as the free backend wakes from sleep. After that it's instant!

---

Imagine a city where finding a parking spot is effortless, where traffic congestion is minimized, and where you can seamlessly navigate urban mobility. That's the vision behind **SmartPark** — Bangalore's premier AI-powered smart parking solution.

SmartPark is a full-stack, machine-learning-driven platform that predicts parking availability across 30 major lots in Bangalore, trained on a massive custom dataset of 600,000 real-world records. It is completely free to use, focusing entirely on spatial efficiency and AI prediction rather than monetization.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **AI Availability Predictor** | A custom `RandomForestClassifier` trained on 600K rows of Bangalore parking data predicts real-time parking availability. Features an animated, responsive UI with confidence gauges. |
| 📍 **Live Bangalore Map** | Interactive `Leaflet.js` map tracking 30 canonical Bangalore parking nodes (Malls, Offices, Hospitals, Transit hubs) with ML-driven availability clustering. |
| 🔍 **Advanced Filtering** | Client-side, lightning-fast filtering of parking spaces by Availability Score (High/Moderate/Low), Location, and Time of Day. |
| 📅 **Frictionless Booking** | Instant, free spot reservation workflow connecting Seekers directly with Parking Owners. |
| 📊 **Owner Analytics** | Dashboards for parking owners to track real-time occupancy and booking trends. |
| 🔐 **Secure Authentication** | Role-based JWT Auth Guard protecting Admin/Owner routes from standard users. |

---

## 🛠 Technology Stack

| Layer | Technology |
|---|---|
| **Machine Learning** | Python · scikit-learn · Pandas · RandomForestClassifier |
| **Backend API** | Django 4.2 · Django REST Framework (DRF) |
| **Authentication** | `djangorestframework-simplejwt` (JWT Bearer tokens) |
| **Frontend App** | React.js · Redux Toolkit · React Router v6 |
| **Mapping** | `Leaflet.js` · OpenStreetMap / ESRI Satellite tiles |
| **Styling** | Custom Glassmorphism UI · Vanilla CSS · Space Grotesk Font |
| **Database** | SQLite (dev) |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/SRINIVAS-R-Code/parking-predictior-.git
cd parking-predictior-
```

### 2. Set up the Python Backend
```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers scikit-learn pandas joblib

# Run migrations and start server
cd backend_django
python manage.py migrate
python manage.py runserver     
# Server runs on http://127.0.0.1:8000
```

### 3. Run the React Frontend
```bash
cd Frontend
npm install
npm start                      
# App runs on http://localhost:3000
```

---

## 🗂 Project Structure

```text
parking-predictior-/
├── backend_django/            # Django Backend Server
│   ├── api/
│   │   ├── models.py          # User, Parking, Space, Booking, Review schemas
│   │   ├── views.py           # REST APIs (Auth, CRUD, Prediction)
│   │   ├── predictor.py       # Live ML prediction inference engine
│   │   ├── train_model.py     # Script to generate RandomForest model
│   │   ├── bangalore_lots.py  # Canonical coordinate data for 30 Bangalore lots
│   │   └── parking_model.pkl  # Compiled ML artifact
│   └── smart_parking_bengaluru_600k.csv  # 600K row ML training dataset
├── Frontend/                  # React Frontend App
│   ├── public/
│   └── src/
│       ├── components/        # Reusable UI cards and forms
│       ├── pages/             # Predictor, Map, Bookings, Auth flows
│       ├── api/api.js         # Axios HTTP interceptors
│       ├── reducers/          # Redux state slices
│       └── css/global.css     # Design system tokens and animations
└── README.md
```

---

## 👤 Author

**Srinivas R**
- GitHub: [@SRINIVAS-R-Code](https://github.com/SRINIVAS-R-Code)
- Email: srinivassrini14592@gmail.com

---

## 📄 License

ISC © 2026 Srinivas R

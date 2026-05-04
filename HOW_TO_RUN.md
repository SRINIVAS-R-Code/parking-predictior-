# 🚀 How to Run SmartPark (Step-by-Step Guide)

This guide will walk you through exactly how to set up and run the SmartPark application from absolute scratch.

---

## 🛠️ Phase 1: Prerequisites

Before you begin, ensure you have the following installed on your computer:
1. **Python** (v3.9 or higher) - [Download Here](https://www.python.org/downloads/)
2. **Node.js** (v18 or higher) - [Download Here](https://nodejs.org/)
3. **Git** - [Download Here](https://git-scm.com/downloads)

*(To verify, open your terminal and type `python --version` and `node -v` to ensure they print version numbers).*

---

## 📥 Phase 2: Get the Code

1. Open your terminal or command prompt.
2. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/SRINIVAS-R-Code/parking-predictior-.git
   ```
3. Navigate into the project folder:
   ```bash
   cd parking-predictior-
   ```

---

## 🐍 Phase 3: Start the Django Backend (AI Model & API)

You need to run the backend first so the AI model and database are available.

1. **Open a new terminal window** and navigate to your `parking-predictior-` folder.
2. **Create a virtual environment** to keep Python packages isolated:
   ```bash
   python -m venv venv
   ```
3. **Activate the virtual environment**:
   - On **Windows**:
     ```bash
     venv\Scripts\activate
     ```
   - On **Mac/Linux**:
     ```bash
     source venv/bin/activate
     ```
   *(You should see `(venv)` appear at the start of your terminal line).*

4. **Install all required Python packages**:
   ```bash
   pip install django djangorestframework djangorestframework-simplejwt django-cors-headers scikit-learn pandas joblib
   ```

5. **Navigate into the backend folder**:
   ```bash
   cd backend_django
   ```

6. **Set up the database**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

7. **(Optional) Seed the database with the Bangalore 30-Lot dataset**:
   If your map is empty, run this command to inject the default parking locations:
   ```bash
   python seed.py
   ```

8. **Start the backend server**:
   ```bash
   python manage.py runserver
   ```
   ✅ *Your backend is now running at `http://127.0.0.1:8000`. Leave this terminal window open!*

---

## ⚛️ Phase 4: Start the React Frontend (User Interface)

Now you need to start the visual website.

1. **Open a SECOND, brand new terminal window.**
2. Navigate to your project folder, then into the Frontend folder:
   ```bash
   cd path/to/parking-predictior-/Frontend
   ```

3. **Install all required Node packages** (you only need to do this once):
   ```bash
   npm install
   ```

4. **Start the React development server**:
   ```bash
   npm start
   ```
   ✅ *Your browser should automatically open to `http://localhost:3000`.*

---

## 🧪 Phase 5: Testing the Application

Once both terminals are running (one running Django, one running React), follow these steps to test:

1. **View the Home Page**: Open `http://localhost:3000` in your browser.
2. **Create an Account**: Click "Get Started" and create an account as an `owner` or `seeker`.
3. **Alternatively, use the test credentials**:
   - **Email**: `srinivassrini14592@gmail.com`
   - **Password**: `@Seena123`
4. **Test the Predictor**: Navigate to the "Predictor" tab, pick a Bangalore location, and click Predict. The AI will instantly calculate the probability of finding a spot based on the 600K dataset!
5. **View the Map**: Navigate to the "Parking" tab to see all 30 live locations.

---

### 🛑 How to Stop the Servers
When you are done testing:
1. Go to your **React terminal** and press `Ctrl + C`, then type `Y` to terminate.
2. Go to your **Django terminal** and press `Ctrl + C`.

To run it again next time, just activate your python environment (`venv\Scripts\activate`), run `python manage.py runserver` in one terminal, and `npm start` in the other.

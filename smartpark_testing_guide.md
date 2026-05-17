# 🚀 SmartPark: Step-by-Step Run & Test Guide

Since the AI automated browser tester is currently facing server capacity issues, I have verified the code and prepared this step-by-step guide. 

Currently, your **Frontend** is running, but your **Backend (Django)** is stopped. You need to start the backend for the prediction and data to load properly.

Follow these exact steps to run the complete project and test it end-to-end for your presentation.

---

## Part 1: How to Start the Project

You need **TWO** separate terminal windows open simultaneously. One for the backend API, and one for the frontend UI.

### 🟢 1. Start the Django Backend
Open a new terminal in VS Code (`Terminal -> New Terminal`), and run the following commands exactly:

```bash
# 1. Navigate into the backend folder
cd "backend_django"

# 2. Activate your virtual environment
venv\Scripts\activate

# 3. Start the Python Django server
python manage.py runserver
```
*Wait until you see: `Starting development server at http://127.0.0.1:8000/`*

### 🔵 2. Start the React Frontend
*(Note: Your frontend is actually already running in your current terminal! But here is the command for future reference.)*
Open a second, separate terminal window in VS Code, and run:

```bash
# 1. Navigate to the frontend folder
cd "Frontend"

# 2. Start the React app
npm start
```
*This will automatically open your browser to `http://localhost:3000/`*

---

## Part 2: How to Test the Full Website (End-to-End)

Once both servers are running, follow this script to test the complete user flow. This is the exact flow you should show your mentor during the presentation.

### 📝 Step 1: Account Creation & Login
1. Go to `http://localhost:3000/register`
2. Fill out the form:
   * **Name:** Test User
   * **Email:** demo@smartpark.com
   * **Password:** Smartpark@123
   * **User Type:** select `seeker`
3. Click Register. Once successful, it should take you to login.
4. Login using `demo@smartpark.com` and `Smartpark@123`.

### 🗺️ Step 2: The Map & Machine Learning Core
1. After logging in, navigate to the **Parking** tab from the navbar (or go to `/parking`).
2. **What to test:** 
   * Check if the interactive map of Bengaluru loads.
   * Look at the colored markers representing the 30 major parking lots (Malls, Hospitals, Airports).
   * **Click on a marker:** A popup will appear showing the location name, price, and the **AI predicted availability score** (e.g., "75% Available").
   * *This proves the Random Forest model is actively generating predictions based on the `bangalore_lots.py` coordinates.*

### 🔮 Step 3: The AI Predictor Dashboard
1. Click on **Predictor** in the navigation bar.
2. **What to test:**
   * This is your manual AI testing ground. Select a location (like *Orion Mall*).
   * Change the time to a peak hour (e.g., 6:00 PM / 18:00) vs an off-peak hour (e.g., 6:00 AM).
   * Click **Predict**. 
   * Notice how the AI prediction changes dynamically. At peak hours, availability will drop (Low Availability). At off-peak hours, it will rise (High Availability).

### 📅 Step 4: The Booking Flow
1. Go back to the **Parking** map.
2. Select any parking location that has high availability and click **"View Spaces"** or **"Book Now"**.
3. **What to test:**
   * Enter dummy vehicle details:
     * Company: *Honda*
     * Model: *Civic*
     * Plate Number: *KA-01-AB-1234*
     * Color: *Black*
   * Submit the booking.
   * You should see a success message. 

### 👤 Step 5: Profile & Management
1. Click on your **Profile** in the top right.
2. **What to test:**
   * Verify your user details are visible.
   * Check the "My Bookings" or "History" tab to see the booking you just created in Step 4. It should be listed as `Pending` or `Approved`.

---

## 🛑 Troubleshooting 

If the website isn't showing map markers or logging you in, check these two things:
1. Ensure `python manage.py runserver` is still actively running in the backend terminal without red error text.
2. Open Chrome Developer Tools (`F12`), go to the **Console** tab, and see if there are any red `Network Error` or `CORS` errors indicating the frontend can't reach the backend.

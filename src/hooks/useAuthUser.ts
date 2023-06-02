import { initializeApp, FirebaseOptions } from "firebase/app";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyBHc_cV0u0BlbIMU9HBw1CsbWaZupHW0p0",
  authDomain: "strava-dashboard-368b0.firebaseapp.com",
  databaseURL:
    "https://strava-dashboard-368b0-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "strava-dashboard-368b0",
  storageBucket: "strava-dashboard-368b0.appspot.com",
  messagingSenderId: "432310382933",
  appId: "1:432310382933:web:d78d8aff13af4759333fdc",
};

initializeApp(firebaseConfig);

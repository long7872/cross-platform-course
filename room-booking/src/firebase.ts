import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDmjqqbIcpykN4I3TMrYI98UAHbqc_09eA",
  authDomain: "multi-platform-room-booking.firebaseapp.com",
  projectId: "multi-platform-room-booking",
  storageBucket: "multi-platform-room-booking.firebasestorage.app",
  messagingSenderId: "1025454110894",
  appId: "1:1025454110894:web:630cd9749559feaf40153f"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCxuge8J_91R_a9g8bLU3gQTdEZfDziNJg",
  authDomain: "ks14cloud.firebaseapp.com",
  projectId: "ks14cloud",
  storageBucket: "ks14cloud.firebasestorage.app",
  messagingSenderId: "206275592559",
  appId: "1:206275592559:web:0eafd112f96317a1c4289a",
  measurementId: "G-62B61SS46T"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
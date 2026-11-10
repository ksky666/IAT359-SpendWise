import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBrQLOFdvfuCogj8QbvkIL2-rlfvhNcjrw",
  authDomain: "spendwise-bfaba.firebaseapp.com",
  projectId: "spendwise-bfaba",
  storageBucket: "spendwise-bfaba.firebasestorage.app",
  messagingSenderId: "187450613172",
  appId: "1:187450613172:web:9f36500167661e9dfca6e1",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

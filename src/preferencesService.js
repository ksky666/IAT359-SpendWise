import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

const getPreferencesKey = (uid) => `@spendwise_preferences_${uid}`;

// Save preferences to local storage
export async function savePreferencesLocally(uid, preferences) {
  if (!uid) throw new Error("User ID is required");

  const key = getPreferencesKey(uid);

  await AsyncStorage.setItem(key, JSON.stringify(preferences));
}

// Load saved preferences from local storage
export async function loadPreferencesLocally(uid) {
  if (!uid) throw new Error("User ID is required");

  const key = getPreferencesKey(uid);
  const savedData = await AsyncStorage.getItem(key);

  if (savedData === null) {
    return null;
  }

  return JSON.parse(savedData);
}

// Remove locally saved preferences
export async function removePreferencesLocally(uid) {
  if (!uid) throw new Error("User ID is required");

  await AsyncStorage.removeItem(getPreferencesKey(uid));
}

// Save preferences to Firestore
export async function savePreferencesToFirestore(uid, preferences) {
  if (!uid) throw new Error("User ID is required");

  const userRef = doc(db, "users", uid);

  await setDoc(
    userRef,
    {
      defaultCurrency: preferences.defaultCurrency,
      monthlyBudget: preferences.monthlyBudget,
      notificationsEnabled: preferences.notificationsEnabled,
      setupCompleted: true,
    },
    { merge: true },
  );
}

// Load preferences from Firestore
export async function loadPreferencesFromFirestore(uid) {
  if (!uid) throw new Error("User ID is required");

  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return {
    defaultCurrency: data.defaultCurrency ?? "CAD",
    monthlyBudget: data.monthlyBudget ?? 0,
    notificationsEnabled: data.notificationsEnabled ?? false,
  };
}

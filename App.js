import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Alert, Text, Button } from "react-native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./src/firebaseConfig";

import {
  createExpense,
  deleteExpense,
  subscribeToExpenses,
  updateExpense,
} from "./src/expenseService";

import {
  savePreferencesLocally,
  savePreferencesToFirestore,
} from "./src/preferencesService";

import HomeScreen from "./src/screens/HomeScreen";
import AddExpenseScreen from "./src/screens/AddExpenseScreen";
import StatisticsScreen from "./src/screens/StatisticsScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import ExpenseDetailsScreen from "./src/screens/ExpenseDetailsScreen";

import LoginScreen from "./src/screens/LoginScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import PreferencesSetupScreen from "./src/screens/PreferencesSetupScreen";

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

// Home navigation, including expense details and editing.
function HomeStackScreen({ expenses }) {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeOverview">
        {(props) => <HomeScreen {...props} expenses={expenses} />}
      </HomeStack.Screen>

      <HomeStack.Screen name="ExpenseDetails">
        {(props) => (
          <ExpenseDetailsScreen
            {...props}
            expenses={expenses}
            onDelete={deleteExpense}
          />
        )}
      </HomeStack.Screen>

      <HomeStack.Screen name="EditExpense">
        {({ navigation, route }) => {
          const expense = expenses.find(
            (item) => item.id === route.params?.expenseId,
          );

          if (!expense) {
            return (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  padding: 24,
                }}
              >
                <Text>This expense is no longer available.</Text>
                <Button title="Go back" onPress={() => navigation.goBack()} />
              </View>
            );
          }

          return (
            <AddExpenseScreen
              key={expense.id}
              navigation={navigation}
              initialExpense={expense}
              onSave={async (changes) => {
                await updateExpense(expense.id, changes);

                if (navigation.isFocused()) {
                  navigation.goBack();
                }
              }}
            />
          );
        }}
      </HomeStack.Screen>
    </HomeStack.Navigator>
  );
}

// Authentication navigation.
function AuthStackScreen() {
  return (
    <AuthStack.Navigator
      initialRouteName="Welcome"
      screenOptions={{ headerShown: false }}
    >
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />

      <AuthStack.Screen name="Login" component={LoginScreen} />

      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Preferences setup state.
  const [setupCompleted, setSetupCompleted] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);

  // Firestore expense subscription state.
  const [expenseFeed, setExpenseFeed] = useState(null);

  const userId = user?.uid ?? null;

  const expenses = expenseFeed?.userId === userId ? expenseFeed.items : [];

  // Listen for authentication changes and check preferences.
  useEffect(() => {
    let checkId = 0;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const currentCheck = ++checkId;

      setUser(currentUser);
      setAuthLoading(true);
      setSetupCompleted(false);

      if (!currentUser) {
        setAuthLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const snapshot = await getDoc(userRef);

        if (currentCheck !== checkId) return;

        const completed =
          snapshot.exists() && snapshot.data().setupCompleted === true;

        setSetupCompleted(completed);
      } catch (error) {
        if (currentCheck !== checkId) return;

        console.error("Failed to check setup status:", error);

        Alert.alert(
          "Connection Error",
          "Unable to load your account settings. Please try again.",
        );

        // Do not treat a failed request as incomplete setup.
        return;
      }

      if (currentCheck === checkId) {
        setAuthLoading(false);
      }
    });

    return () => {
      checkId++;
      unsubscribe();
    };
  }, []);

  // Subscribe to the signed-in user's expenses.
  useEffect(() => {
    setExpenseFeed(null);

    if (!userId) return;

    return subscribeToExpenses(
      userId,
      (items) => {
        setExpenseFeed({ userId, items });
      },
      (error) => {
        console.warn("Unable to load expenses:", error.code);

        Alert.alert(
          "Unable to load expenses",
          "Please check your connection and try again.",
        );
      },
    );
  }, [userId]);

  // Create an expense in Firestore.
  async function saveExpense(expense) {
    await createExpense(expense);
  }

  // Complete initial preferences setup.
  async function handlePreferencesComplete(preferences) {
    if (!user?.uid || savingPreferences) return;

    setSavingPreferences(true);

    try {
      // Firestore is the source of truth.
      await savePreferencesToFirestore(user.uid, preferences);

      // Local storage acts as a cache.
      try {
        await savePreferencesLocally(user.uid, preferences);
      } catch (localError) {
        console.warn("Failed to cache preferences locally:", localError);
      }

      setSetupCompleted(true);
    } catch (error) {
      console.error("Failed to save preferences:", error);

      Alert.alert(
        "Save Failed",
        "Your preferences could not be saved. Please try again.",
      );
    } finally {
      setSavingPreferences(false);
    }
  }

  // Wait for authentication and preferences verification.
  if (authLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#333333" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStackScreen />
      ) : !setupCompleted ? (
        <PreferencesSetupScreen onComplete={handlePreferencesComplete} />
      ) : (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: "#333333",
            tabBarInactiveTintColor: "#999999",
            tabBarIcon: ({ color, size }) => {
              const icons = {
                Home: "home-outline",
                Add: "add-circle-outline",
                Stats: "bar-chart-outline",
                Profile: "person-outline",
              };

              return (
                <Ionicons name={icons[route.name]} size={size} color={color} />
              );
            },
          })}
        >
          <Tab.Screen name="Home">
            {() => <HomeStackScreen expenses={expenses} />}
          </Tab.Screen>

          <Tab.Screen name="Add">
            {(props) => <AddExpenseScreen {...props} onSave={saveExpense} />}
          </Tab.Screen>

          <Tab.Screen name="Stats" component={StatisticsScreen} />

          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      )}
    </NavigationContainer>
  );
}

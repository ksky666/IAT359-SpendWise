import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

export async function createExpense(expense) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("You must sign in before saving an expense.");
  }

  const expenseRef = await addDoc(
    collection(db, "users", user.uid, "expenses"),
    {
      name: expense.name,
      store: expense.store ?? "",
      category: expense.category,
      amount: expense.amount,
      currency: expense.currency,
      date: expense.date,
      note: expense.note ?? "",
      amountCad:
        expense.amountCad ??
        (expense.currency === "CAD" ? expense.amount : null),
      exchangeRate: expense.exchangeRate ?? null,
      exchangeRateDate: expense.exchangeRateDate ?? null,
      createdAt: serverTimestamp(),
    },
  );

  return expenseRef.id;
}

export function subscribeToExpenses(userId, onExpenses, onError) {
  const expensesQuery = query(
    collection(db, "users", userId, "expenses"),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(
    expensesQuery,
    (snapshot) => {
      const expenses = snapshot.docs.map((document) => ({
        ...document.data(),
        id: document.id,
      }));

      onExpenses(expenses);
    },
    onError,
  );
}

function getExpenseRef(expenseId) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("You must sign in to manage expenses.");
  }

  return doc(db, "users", user.uid, "expenses", expenseId);
}

export async function updateExpense(expenseId, expense) {
  await updateDoc(getExpenseRef(expenseId), {
    name: expense.name,
    store: expense.store ?? "",
    category: expense.category,
    amount: expense.amount,
    currency: expense.currency,
    date: expense.date,
    note: expense.note ?? "",
    amountCad: expense.amountCad,
    exchangeRate: expense.exchangeRate,
    exchangeRateDate: expense.exchangeRateDate ?? null,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteExpense(expenseId) {
  await deleteDoc(getExpenseRef(expenseId));
}

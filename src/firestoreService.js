// src/firestoreService.js
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export const fetchCollection = async (collectionName) => {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

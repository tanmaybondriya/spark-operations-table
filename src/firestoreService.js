// firestoreService.js
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "./firebase";

// Fetch all documents from a collection
export const fetchCollection = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    throw error;
  }
};

// Fetch documents with ordering and limit
export const fetchCollectionOrdered = async (collectionName, orderByField, orderDirection = 'desc', limitCount = 100) => {
  try {
    const queryConstraints = [];
    if (orderByField) {
      queryConstraints.push(orderBy(orderByField, orderDirection));
    }
    if (limitCount) {
      queryConstraints.push(limit(limitCount));
    }
    
    const q = query(collection(db, collectionName), ...queryConstraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
  } catch (error) {
    console.error(`Error fetching ordered ${collectionName}:`, error);
    throw error;
  }
};

// Fetch documents with filtering
export const fetchCollectionWithFilter = async (collectionName, filterField, filterValue, operator = '==') => {
  try {
    const q = query(collection(db, collectionName), where(filterField, operator, filterValue));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
  } catch (error) {
    console.error(`Error fetching filtered ${collectionName}:`, error);
    throw error;
  }
};

// Fetch recent bookings (last 7 days)
export const fetchRecentBookings = async () => {
  try {
    // Get date from 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Convert to timestamp seconds for Firestore query
    const timestamp = Math.floor(sevenDaysAgo.getTime() / 1000);
    
    const q = query(
      collection(db, "bookings"),
      where("start_date.seconds", ">=", timestamp),
      orderBy("start_date.seconds", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
  } catch (error) {
    console.error("Error fetching recent bookings:", error);
    throw error;
  }
};
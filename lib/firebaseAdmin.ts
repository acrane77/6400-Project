import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const firebaseConfig = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.replace(/\\n/g, "\n")
}

if (!getApps().length) {
    initializeApp({
        credential: cert({
            ...firebaseConfig
        })
    })
}
export const adminDb = getFirestore();
export const adminAuth = getAuth();
export const adminStorage = getStorage();
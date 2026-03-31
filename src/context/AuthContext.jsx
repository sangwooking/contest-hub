import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import { doc, setDoc, getDoc } from "firebase/firestore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 로그인 상태 유지
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    try {
      console.log("firebaseUser:", firebaseUser);

      if (firebaseUser) {
        let userData = {};

        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            userData = docSnap.data();
          }
        } catch (firestoreError) {
          console.error("Firestore read error:", firestoreError);
        }

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          ...userData,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  });

  return () => unsubscribe();
}, []);

  // 🔥 회원가입
  const signup = async ({ email, password, nickname }) => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        nickname,
        createdAt: new Date().toISOString(),
      });

      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  // 🔥 로그인
  const login = async ({ email, password }) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  // 🔥 로그아웃
  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        signup,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
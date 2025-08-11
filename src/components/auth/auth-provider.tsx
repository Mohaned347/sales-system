"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, signOut as firebaseSignOut } from '../../lib/firebase'
import { useRouter } from 'next/navigation';

interface UserData {
  uid: string
  email: string | null
  displayName: string | null
  role: string
  subscriptionStatus: string
  trialEndDate?: Date
  storeData?: {
    storeName: string
    storeAddress: string
    storePhone: string
    storeWebsite: string
    currency: string
    language: string
  }
}


interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  isTrialExpired: () => boolean;
  getDaysLeftInTrial: () => number;
  canAccessFeature: (feature: string) => boolean;
  signOut: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              role: userData.role || 'user',
              subscriptionStatus: userData.subscriptionStatus || 'trial',
              trialEndDate: userData.trialEndDate?.toDate(),
              storeData: userData.storeData
            })
          } else {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              role: 'user',
              subscriptionStatus: 'trial'
            })
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            role: 'user',
            subscriptionStatus: 'trial'
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const isTrialExpired = () => {
    if (!user || !user.trialEndDate) return false
    return new Date() > user.trialEndDate
  }

  const getDaysLeftInTrial = () => {
    if (!user || !user.trialEndDate) return 0
    const now = new Date()
    const daysLeft = Math.ceil((user.trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, daysLeft)
  }

  const canAccessFeature = (feature: string) => {
    if (!user) return false
    
    // Check if trial is expired
    if (user.subscriptionStatus === 'trial' && isTrialExpired()) {
      return false
    }

    // Add feature-specific checks here
    switch (feature) {
      case 'basic':
        return true // All users can access basic features
      case 'advanced':
        return user.subscriptionStatus === 'paid' || user.role === 'admin'
      case 'premium':
        return user.subscriptionStatus === 'paid' && user.role === 'premium'
      default:
        return true
    }
  }


  const signOut = async () => {
    await firebaseSignOut(auth);
    // مسح الكوكيز
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax';
    // مسح التخزين المحلي
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    // انتظر حتى يتم تحديث user فعلياً قبل التوجيه
    setTimeout(() => {
      router.replace('/login');
    }, 0);
  };

  const value = {
    user,
    loading,
    isTrialExpired,
    getDaysLeftInTrial,
    canAccessFeature,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 
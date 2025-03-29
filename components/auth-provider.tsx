"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { getUserProfile, createUserProfile, updateUserProfile, hasPermission } from "@/lib/auth"
import type { UserProfile, AuthContextType } from "@/lib/auth-types"

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signIn: async () => {
    throw new Error("Not implemented")
  },
  signUp: async () => {
    throw new Error("Not implemented")
  },
  logout: async () => {
    throw new Error("Not implemented")
  },
  updateProfile: async () => {
    throw new Error("Not implemented")
  },
  isAdmin: () => false,
  hasPermission: () => false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        try {
          // Get user profile from Firestore
          let profile = await getUserProfile(user.uid)

          // If profile doesn't exist, create it
          if (!profile) {
            profile = await createUserProfile(user.uid, user.email || "", user.displayName || "")
          } else {
            // Update last login
            await updateUserProfile(user.uid, {
              lastLogin: new Date(),
            })
          }

          setUserProfile(profile)
        } catch (error) {
          console.error("Error loading user profile:", error)
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result.user
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)

    // Update display name
    await updateFirebaseProfile(result.user, { displayName })

    // Create user profile
    await createUserProfile(result.user.uid, email, displayName)

    return result.user
  }

  const logout = async () => {
    await signOut(auth)
  }

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error("No user logged in")

    await updateUserProfile(user.uid, data)

    // Update local state
    setUserProfile((prev) => (prev ? { ...prev, ...data } : null))

    // Update Firebase auth profile if display name changed
    if (data.displayName && data.displayName !== user.displayName) {
      await updateFirebaseProfile(user, { displayName: data.displayName })
    }
  }

  const isAdmin = () => {
    return userProfile?.role === "admin"
  }

  const checkPermission = (permission: string) => {
    if (!userProfile) return false
    return hasPermission(userProfile, permission)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signIn,
        signUp,
        logout,
        updateProfile,
        isAdmin,
        hasPermission: checkPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)


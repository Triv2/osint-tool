import type { User } from "firebase/auth"

export type UserRole = "admin" | "analyst" | "viewer"

export interface Team {
  id: string
  name: string
  description?: string
  createdAt: Date
  ownerId: string
  members: TeamMember[]
}

export interface TeamMember {
  userId: string
  email: string
  displayName?: string
  role: UserRole
  joinedAt: Date
}

export interface UserProfile {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  role: UserRole
  teams: string[] // Team IDs
  settings?: UserSettings
  createdAt: Date
  lastLogin: Date
}

export interface UserSettings {
  theme: "light" | "dark" | "system"
  notifications: {
    email: boolean
    highRiskAlerts: boolean
    mediumRiskAlerts: boolean
    lowRiskAlerts: boolean
  }
  defaultSearchSettings?: {
    saveAsCase: boolean
    queryType: string
  }
}

export interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<User>
  signUp: (email: string, password: string, displayName: string) => Promise<User>
  logout: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
  isAdmin: () => boolean
  hasPermission: (permission: string) => boolean
}


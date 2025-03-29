import { db } from "./firebase"
import { collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs, Timestamp } from "firebase/firestore"
import type { UserProfile, Team, UserRole, TeamMember } from "./auth-types"

// Create a new user profile
export async function createUserProfile(uid: string, email: string, displayName?: string): Promise<UserProfile> {
  try {
    const now = new Date()

    const userProfile: UserProfile = {
      uid,
      email,
      displayName: displayName || "",
      role: "analyst", // Default role
      teams: [],
      createdAt: now,
      lastLogin: now,
      settings: {
        theme: "system",
        notifications: {
          email: true,
          highRiskAlerts: true,
          mediumRiskAlerts: true,
          lowRiskAlerts: false,
        },
      },
    }

    await setDoc(doc(db, "users", uid), {
      ...userProfile,
      createdAt: Timestamp.fromDate(now),
      lastLogin: Timestamp.fromDate(now),
    })

    return userProfile
  } catch (error) {
    console.error("Error creating user profile:", error)
    throw error
  }
}

// Get a user profile
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid))

    if (!userDoc.exists()) {
      return null
    }

    const userData = userDoc.data()

    return {
      ...userData,
      uid,
      createdAt: userData.createdAt.toDate(),
      lastLogin: userData.lastLogin.toDate(),
    } as UserProfile
  } catch (error) {
    console.error("Error getting user profile:", error)
    throw error
  }
}

// Update a user profile
export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  try {
    const userRef = doc(db, "users", uid)

    // Remove fields that shouldn't be updated directly
    const { createdAt, uid: _, ...updateData } = data as any

    // Update last login if not specified
    if (!updateData.lastLogin) {
      updateData.lastLogin = Timestamp.now()
    } else if (updateData.lastLogin instanceof Date) {
      updateData.lastLogin = Timestamp.fromDate(updateData.lastLogin)
    }

    await updateDoc(userRef, updateData)
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

// Create a new team
export async function createTeam(name: string, ownerId: string, description?: string): Promise<Team> {
  try {
    const now = new Date()

    // Get owner info
    const ownerProfile = await getUserProfile(ownerId)

    if (!ownerProfile) {
      throw new Error("Owner profile not found")
    }

    const teamData: Omit<Team, "id"> = {
      name,
      description: description || "",
      createdAt: now,
      ownerId,
      members: [
        {
          userId: ownerId,
          email: ownerProfile.email,
          displayName: ownerProfile.displayName,
          role: "admin",
          joinedAt: now,
        },
      ],
    }

    // Create team document
    const teamRef = doc(collection(db, "teams"))
    await setDoc(teamRef, {
      ...teamData,
      createdAt: Timestamp.fromDate(now),
      members: teamData.members.map((member) => ({
        ...member,
        joinedAt: Timestamp.fromDate(member.joinedAt),
      })),
    })

    const teamId = teamRef.id

    // Update user's teams array
    await updateDoc(doc(db, "users", ownerId), {
      teams: [...(ownerProfile.teams || []), teamId],
    })

    return {
      id: teamId,
      ...teamData,
    }
  } catch (error) {
    console.error("Error creating team:", error)
    throw error
  }
}

// Get a team by ID
export async function getTeam(teamId: string): Promise<Team | null> {
  try {
    const teamDoc = await getDoc(doc(db, "teams", teamId))

    if (!teamDoc.exists()) {
      return null
    }

    const teamData = teamDoc.data()

    return {
      id: teamId,
      ...teamData,
      createdAt: teamData.createdAt.toDate(),
      members: teamData.members.map((member: any) => ({
        ...member,
        joinedAt: member.joinedAt.toDate(),
      })),
    } as Team
  } catch (error) {
    console.error("Error getting team:", error)
    throw error
  }
}

// Get all teams for a user
export async function getUserTeams(uid: string): Promise<Team[]> {
  try {
    const userProfile = await getUserProfile(uid)

    if (!userProfile || !userProfile.teams || userProfile.teams.length === 0) {
      return []
    }

    const teams: Team[] = []

    for (const teamId of userProfile.teams) {
      const team = await getTeam(teamId)
      if (team) {
        teams.push(team)
      }
    }

    return teams
  } catch (error) {
    console.error("Error getting user teams:", error)
    throw error
  }
}

// Add a member to a team
export async function addTeamMember(teamId: string, email: string, role: UserRole): Promise<void> {
  try {
    // Find user by email
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("email", "==", email))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      throw new Error("User not found")
    }

    const userDoc = querySnapshot.docs[0]
    const userId = userDoc.id
    const userData = userDoc.data() as UserProfile

    // Get team
    const teamRef = doc(db, "teams", teamId)
    const teamDoc = await getDoc(teamRef)

    if (!teamDoc.exists()) {
      throw new Error("Team not found")
    }

    const teamData = teamDoc.data() as Team

    // Check if user is already a member
    if (teamData.members.some((member) => member.userId === userId)) {
      throw new Error("User is already a member of this team")
    }

    // Add user to team
    const now = new Date()
    const newMember: TeamMember = {
      userId,
      email,
      displayName: userData.displayName,
      role,
      joinedAt: now,
    }

    await updateDoc(teamRef, {
      members: [
        ...teamData.members,
        {
          ...newMember,
          joinedAt: Timestamp.fromDate(now),
        },
      ],
    })

    // Add team to user's teams array
    await updateDoc(doc(db, "users", userId), {
      teams: [...(userData.teams || []), teamId],
    })
  } catch (error) {
    console.error("Error adding team member:", error)
    throw error
  }
}

// Remove a member from a team
export async function removeTeamMember(teamId: string, userId: string): Promise<void> {
  try {
    // Get team
    const teamRef = doc(db, "teams", teamId)
    const teamDoc = await getDoc(teamRef)

    if (!teamDoc.exists()) {
      throw new Error("Team not found")
    }

    const teamData = teamDoc.data() as Team

    // Check if user is a member
    if (!teamData.members.some((member) => member.userId === userId)) {
      throw new Error("User is not a member of this team")
    }

    // Check if user is the owner
    if (teamData.ownerId === userId) {
      throw new Error("Cannot remove the team owner")
    }

    // Remove user from team
    await updateDoc(teamRef, {
      members: teamData.members.filter((member) => member.userId !== userId),
    })

    // Remove team from user's teams array
    const userDoc = await getDoc(doc(db, "users", userId))

    if (userDoc.exists()) {
      const userData = userDoc.data() as UserProfile

      await updateDoc(doc(db, "users", userId), {
        teams: (userData.teams || []).filter((id) => id !== teamId),
      })
    }
  } catch (error) {
    console.error("Error removing team member:", error)
    throw error
  }
}

// Update a team member's role
export async function updateTeamMemberRole(teamId: string, userId: string, role: UserRole): Promise<void> {
  try {
    // Get team
    const teamRef = doc(db, "teams", teamId)
    const teamDoc = await getDoc(teamRef)

    if (!teamDoc.exists()) {
      throw new Error("Team not found")
    }

    const teamData = teamDoc.data() as Team

    // Check if user is a member
    const memberIndex = teamData.members.findIndex((member) => member.userId === userId)

    if (memberIndex === -1) {
      throw new Error("User is not a member of this team")
    }

    // Check if user is the owner and trying to change their role
    if (teamData.ownerId === userId && role !== "admin") {
      throw new Error("Cannot change the role of the team owner")
    }

    // Update member's role
    const updatedMembers = [...teamData.members]
    updatedMembers[memberIndex] = {
      ...updatedMembers[memberIndex],
      role,
    }

    await updateDoc(teamRef, {
      members: updatedMembers,
    })
  } catch (error) {
    console.error("Error updating team member role:", error)
    throw error
  }
}

// Check if a user has a specific permission
export function hasPermission(userProfile: UserProfile, permission: string): boolean {
  // Define permission mappings
  const rolePermissions: Record<UserRole, string[]> = {
    admin: [
      "create:case",
      "read:case",
      "update:case",
      "delete:case",
      "create:team",
      "read:team",
      "update:team",
      "delete:team",
      "create:user",
      "read:user",
      "update:user",
      "delete:user",
      "read:settings",
      "update:settings",
      "read:api-keys",
      "update:api-keys",
    ],
    analyst: [
      "create:case",
      "read:case",
      "update:case",
      "read:team",
      "read:user",
      "read:settings",
      "update:settings",
      "read:api-keys",
    ],
    viewer: ["read:case", "read:team", "read:user", "read:settings"],
  }

  // Check if the user's role has the requested permission
  return rolePermissions[userProfile.role]?.includes(permission) || false
}


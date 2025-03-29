import { db } from "./firebase"
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  type Timestamp,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"

// Notification types
export type NotificationType = "case_created" | "case_updated" | "high_risk_alert" | "team_invite" | "system"

// Notification interface
export interface Notification {
  id?: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  data?: any
  createdAt: Timestamp
  userId: string
}

// Subscribe to notifications for a user
export function subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
  const notificationsRef = collection(db, "notifications")
  const q = query(notificationsRef, where("userId", "==", userId), orderBy("createdAt", "desc"), limit(50))

  return onSnapshot(q, (snapshot) => {
    const notifications: Notification[] = []

    snapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...(doc.data() as Omit<Notification, "id">),
      })
    })

    callback(notifications)
  })
}

// Create a notification
export async function createNotification(notification: Omit<Notification, "id" | "createdAt">) {
  try {
    const notificationData = {
      ...notification,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, "notifications"), notificationData)
    return docRef.id
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

// Mark a notification as read
export async function markNotificationAsRead(notificationId: string) {
  try {
    await db.doc(`notifications/${notificationId}`).update({
      read: true,
    })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    throw error
  }
}

// Mark all notifications as read for a user
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const notificationsRef = collection(db, "notifications")
    const q = query(notificationsRef, where("userId", "==", userId), where("read", "==", false))

    const snapshot = await q.get()

    const batch = db.batch()

    snapshot.forEach((doc) => {
      batch.update(doc.ref, { read: true })
    })

    await batch.commit()
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    throw error
  }
}

// Subscribe to real-time case updates
export function subscribeToCases(
  callback: (cases: any[]) => void,
  options?: {
    userId?: string
    riskLevel?: string
    queryType?: string
    limit?: number
  },
) {
  const casesRef = collection(db, "cases")
  let q = query(casesRef, orderBy("createdAt", "desc"))

  if (options?.userId) {
    q = query(q, where("userId", "==", options.userId))
  }

  if (options?.riskLevel) {
    q = query(q, where("riskLevel", "==", options.riskLevel))
  }

  if (options?.queryType) {
    q = query(q, where("queryType", "==", options.queryType))
  }

  if (options?.limit) {
    q = query(q, limit(options.limit))
  }

  return onSnapshot(q, (snapshot) => {
    const cases: any[] = []

    snapshot.forEach((doc) => {
      cases.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    callback(cases)
  })
}

// Subscribe to a specific case
export function subscribeToCase(caseId: string, callback: (caseData: any | null) => void) {
  const caseRef = doc(db, "cases", caseId)

  return onSnapshot(caseRef, (doc) => {
    if (doc.exists()) {
      callback({
        id: doc.id,
        ...doc.data(),
      })
    } else {
      callback(null)
    }
  })
}

// Activity log interface
export interface ActivityLog {
  id?: string
  action: string
  details?: string
  userId: string
  userEmail?: string
  userName?: string
  caseId?: string
  createdAt: Timestamp
}

// Log an activity
export async function logActivity(activity: Omit<ActivityLog, "id" | "createdAt">) {
  try {
    const activityData = {
      ...activity,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, "activity_logs"), activityData)
    return docRef.id
  } catch (error) {
    console.error("Error logging activity:", error)
    throw error
  }
}

// Subscribe to activity logs
export function subscribeToActivityLogs(
  callback: (logs: ActivityLog[]) => void,
  options?: {
    userId?: string
    caseId?: string
    limit?: number
  },
) {
  const logsRef = collection(db, "activity_logs")
  let q = query(logsRef, orderBy("createdAt", "desc"))

  if (options?.userId) {
    q = query(q, where("userId", "==", options.userId))
  }

  if (options?.caseId) {
    q = query(q, where("caseId", "==", options.caseId))
  }

  if (options?.limit) {
    q = query(q, limit(options.limit))
  }

  return onSnapshot(q, (snapshot) => {
    const logs: ActivityLog[] = []

    snapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...(doc.data() as Omit<ActivityLog, "id">),
      })
    })

    callback(logs)
  })
}


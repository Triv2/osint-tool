import { db } from "./firebase"
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  type Timestamp,
  serverTimestamp,
} from "firebase/firestore"
import { logActivity } from "./realtime"
import { storeEmbedding, updateEmbedding, getEmbeddingByCaseId } from "./vector-db"

// Case type definition
export interface Case {
  id?: string
  title: string
  query: string
  queryType: string
  date: string
  riskLevel: "high" | "medium" | "low"
  summary: string
  notes?: string
  tags?: string[]
  results?: any
  aiAnalysis?: any
  createdAt?: Timestamp
  updatedAt?: Timestamp
  userId?: string
  teamId?: string
}

// Get all cases with optional filtering
export async function getCases(options?: {
  userId?: string
  teamId?: string
  riskLevel?: string
  queryType?: string
  limit?: number
  orderByField?: string
  orderDirection?: "asc" | "desc"
}) {
  try {
    const casesRef = collection(db, "cases")
    let q = query(casesRef)

    if (options?.userId) {
      q = query(q, where("userId", "==", options.userId))
    }

    if (options?.teamId) {
      q = query(q, where("teamId", "==", options.teamId))
    }

    if (options?.riskLevel) {
      q = query(q, where("riskLevel", "==", options.riskLevel))
    }

    if (options?.queryType) {
      q = query(q, where("queryType", "==", options.queryType))
    }

    if (options?.orderByField) {
      q = query(q, orderBy(options.orderByField, options.orderDirection || "desc"))
    } else {
      q = query(q, orderBy("createdAt", "desc"))
    }

    if (options?.limit) {
      q = query(q, limit(options.limit))
    }

    const querySnapshot = await getDocs(q)
    const cases: Case[] = []

    querySnapshot.forEach((doc) => {
      cases.push({
        id: doc.id,
        ...(doc.data() as Omit<Case, "id">),
      })
    })

    return cases
  } catch (error) {
    console.error("Error getting cases:", error)
    throw error
  }
}

// Get a single case by ID
export async function getCaseById(caseId: string) {
  try {
    const caseRef = doc(db, "cases", caseId)
    const caseSnapshot = await getDoc(caseRef)

    if (!caseSnapshot.exists()) {
      throw new Error("Case not found")
    }

    return {
      id: caseSnapshot.id,
      ...(caseSnapshot.data() as Omit<Case, "id">),
    }
  } catch (error) {
    console.error("Error getting case:", error)
    throw error
  }
}

// Create a new case
export async function createCase(caseData: Omit<Case, "id">, user?: any) {
  try {
    const now = serverTimestamp()

    const newCase = {
      ...caseData,
      createdAt: now,
      updatedAt: now,
    }

    const docRef = await addDoc(collection(db, "cases"), newCase)

    // Store vector embedding for similarity search
    await storeEmbedding({
      ...newCase,
      id: docRef.id,
    })

    // Log activity
    if (user) {
      await logActivity({
        action: `Created case: ${caseData.title}`,
        details: `Query: ${caseData.query}, Risk Level: ${caseData.riskLevel}`,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        caseId: docRef.id,
      })
    }

    return {
      id: docRef.id,
      ...newCase,
    }
  } catch (error) {
    console.error("Error creating case:", error)
    throw error
  }
}

// Update an existing case
export async function updateCase(caseId: string, caseData: Partial<Omit<Case, "id">>, user?: any) {
  try {
    const caseRef = doc(db, "cases", caseId)

    const updateData = {
      ...caseData,
      updatedAt: serverTimestamp(),
    }

    await updateDoc(caseRef, updateData)

    // Update vector embedding
    const embedding = await getEmbeddingByCaseId(caseId)
    if (embedding) {
      // Get the full case data
      const fullCase = await getCaseById(caseId)

      // Update the embedding
      await updateEmbedding(embedding.id!, {
        ...fullCase,
        ...caseData,
      })
    }

    // Log activity
    if (user) {
      await logActivity({
        action: `Updated case: ${caseData.title || "Unknown"}`,
        details: `Updated fields: ${Object.keys(caseData).join(", ")}`,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        caseId,
      })
    }
  } catch (error) {
    console.error("Error updating case:", error)
    throw error
  }
}


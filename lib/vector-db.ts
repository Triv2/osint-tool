import { db } from "./firebase"
import { collection, doc, getDocs, addDoc, updateDoc, query, where, limit, Timestamp } from "firebase/firestore"
import { generateEmbedding } from "./openai"

// Interface for vector data
interface VectorData {
  id?: string
  caseId: string
  embedding: number[]
  metadata: {
    title: string
    query: string
    queryType: string
    riskLevel: string
    summary: string
    date: string
  }
  createdAt: Timestamp
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same dimensions")
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }

  normA = Math.sqrt(normA)
  normB = Math.sqrt(normB)

  if (normA === 0 || normB === 0) {
    return 0
  }

  return dotProduct / (normA * normB)
}

// Store a vector embedding for a case
export async function storeEmbedding(caseData: any): Promise<string> {
  try {
    // Create text to embed
    const textToEmbed = `
      Title: ${caseData.title}
      Query: ${caseData.query}
      Type: ${caseData.queryType}
      Risk Level: ${caseData.riskLevel}
      Summary: ${caseData.summary}
    `

    // Generate embedding
    const embedding = await generateEmbedding(textToEmbed)

    // Store in Firestore
    const vectorData: VectorData = {
      caseId: caseData.id,
      embedding,
      metadata: {
        title: caseData.title,
        query: caseData.query,
        queryType: caseData.queryType,
        riskLevel: caseData.riskLevel,
        summary: caseData.summary,
        date: caseData.date,
      },
      createdAt: Timestamp.now(),
    }

    const docRef = await addDoc(collection(db, "embeddings"), vectorData)
    return docRef.id
  } catch (error) {
    console.error("Error storing embedding:", error)
    throw error
  }
}

// Update an existing embedding
export async function updateEmbedding(embeddingId: string, caseData: any): Promise<void> {
  try {
    // Create text to embed
    const textToEmbed = `
      Title: ${caseData.title}
      Query: ${caseData.query}
      Type: ${caseData.queryType}
      Risk Level: ${caseData.riskLevel}
      Summary: ${caseData.summary}
    `

    // Generate embedding
    const embedding = await generateEmbedding(textToEmbed)

    // Update in Firestore
    const embeddingRef = doc(db, "embeddings", embeddingId)

    await updateDoc(embeddingRef, {
      embedding,
      metadata: {
        title: caseData.title,
        query: caseData.query,
        queryType: caseData.queryType,
        riskLevel: caseData.riskLevel,
        summary: caseData.summary,
        date: caseData.date,
      },
    })
  } catch (error) {
    console.error("Error updating embedding:", error)
    throw error
  }
}

// Find similar cases using vector similarity
export async function findSimilarCases(caseData: any, maxResults = 5): Promise<any[]> {
  try {
    // Create text to embed
    const textToEmbed = `
      Title: ${caseData.title}
      Query: ${caseData.query}
      Type: ${caseData.queryType}
      Risk Level: ${caseData.riskLevel}
      Summary: ${caseData.summary}
    `

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(textToEmbed)

    // Get all embeddings from Firestore
    const embeddingsRef = collection(db, "embeddings")
    const q = query(embeddingsRef, where("caseId", "!=", caseData.id))
    const querySnapshot = await getDocs(q)

    // Calculate similarity scores
    const similarities: { id: string; caseId: string; score: number; metadata: any }[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data() as VectorData
      const score = cosineSimilarity(queryEmbedding, data.embedding)

      similarities.push({
        id: doc.id,
        caseId: data.caseId,
        score,
        metadata: data.metadata,
      })
    })

    // Sort by similarity score (descending)
    similarities.sort((a, b) => b.score - a.score)

    // Return top results
    return similarities.slice(0, maxResults)
  } catch (error) {
    console.error("Error finding similar cases:", error)
    throw error
  }
}

// Get embedding by case ID
export async function getEmbeddingByCaseId(caseId: string): Promise<VectorData | null> {
  try {
    const embeddingsRef = collection(db, "embeddings")
    const q = query(embeddingsRef, where("caseId", "==", caseId), limit(1))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return null
    }

    const doc = querySnapshot.docs[0]
    return {
      id: doc.id,
      ...(doc.data() as Omit<VectorData, "id">),
    }
  } catch (error) {
    console.error("Error getting embedding:", error)
    throw error
  }
}

// Semantic search across all cases
export async function semanticSearch(query: string, maxResults = 10): Promise<any[]> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query)

    // Get all embeddings from Firestore
    const embeddingsRef = collection(db, "embeddings")
    const querySnapshot = await getDocs(embeddingsRef)

    // Calculate similarity scores
    const similarities: { id: string; caseId: string; score: number; metadata: any }[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data() as VectorData
      const score = cosineSimilarity(queryEmbedding, data.embedding)

      similarities.push({
        id: doc.id,
        caseId: data.caseId,
        score,
        metadata: data.metadata,
      })
    })

    // Sort by similarity score (descending)
    similarities.sort((a, b) => b.score - a.score)

    // Return top results
    return similarities.slice(0, maxResults)
  } catch (error) {
    console.error("Error performing semantic search:", error)
    throw error
  }
}


import { db } from "./firebase"
import { collection, doc, getDoc, setDoc, getDocs } from "firebase/firestore"
import { generateEmbedding } from "./openai"

// Generate and store embedding for a case
export async function generateAndStoreEmbedding(caseId: string, textContent: string): Promise<number[]> {
  try {
    // Generate embedding using OpenAI
    const embedding = await generateEmbedding(textContent)

    // Store the embedding in Firestore
    await setDoc(doc(db, "embeddings", caseId), {
      embedding,
      caseId,
      createdAt: new Date(),
    })

    return embedding
  } catch (error) {
    console.error("Error generating and storing embedding:", error)
    throw error
  }
}

// Get embedding for a case
export async function getEmbedding(caseId: string): Promise<number[] | null> {
  try {
    const embeddingDoc = await getDoc(doc(db, "embeddings", caseId))

    if (embeddingDoc.exists()) {
      return embeddingDoc.data().embedding
    }

    return null
  } catch (error) {
    console.error("Error getting embedding:", error)
    throw error
  }
}

// Calculate cosine similarity between two vectors
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length")
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Find similar cases based on embedding similarity
export async function findSimilarCases(
  embedding: number[],
  excludeCaseId?: string,
  minSimilarity = 0.7,
  maxResults = 5,
): Promise<{ caseId: string; similarity: number }[]> {
  try {
    // Get all embeddings
    const embeddingsRef = collection(db, "embeddings")
    const embeddingsSnapshot = await getDocs(embeddingsRef)

    const similarities: { caseId: string; similarity: number }[] = []

    // Calculate similarity for each embedding
    embeddingsSnapshot.forEach((doc) => {
      const data = doc.data()
      const caseId = data.caseId

      // Skip the current case
      if (caseId === excludeCaseId) {
        return
      }

      const similarity = cosineSimilarity(embedding, data.embedding)

      if (similarity >= minSimilarity) {
        similarities.push({ caseId, similarity })
      }
    })

    // Sort by similarity (descending) and limit results
    return similarities.sort((a, b) => b.similarity - a.similarity).slice(0, maxResults)
  } catch (error) {
    console.error("Error finding similar cases:", error)
    throw error
  }
}

// Generate text for embedding
export function generateEmbeddingText(caseData: any): string {
  // Combine relevant case data into a single text string for embedding
  const parts = [
    caseData.title,
    caseData.query,
    caseData.summary,
    caseData.notes || "",
    ...(caseData.tags || []),
    caseData.aiAnalysis?.summary || "",
    ...(caseData.aiAnalysis?.keyFindings || []),
  ]

  return parts.join(" ")
}


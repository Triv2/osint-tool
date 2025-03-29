import { db } from "./firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"

interface ApiKeys {
  shodan?: string
  virustotal?: string
  hibp?: string
  censysApiKey?: string
  censysAppId?: string
  greynoise?: string
  intelx?: string
  openai?: string
}

// Get API keys from Firestore or environment variables
export async function getApiKeys(userId?: string): Promise<ApiKeys> {
  // Try to get from Firestore if userId is provided
  if (userId) {
    try {
      const apiKeysDoc = await getDoc(doc(db, "apiKeys", userId))
      if (apiKeysDoc.exists()) {
        return apiKeysDoc.data() as ApiKeys
      }
    } catch (error) {
      console.error("Error fetching API keys from Firestore:", error)
    }
  }

  // Fallback to environment variables
  return {
    shodan: process.env.SHODAN_API_KEY,
    virustotal: process.env.VIRUSTOTAL_API_KEY,
    hibp: process.env.HIBP_API_KEY,
    censysApiKey: process.env.CENSYS_API_KEY,
    censysAppId: process.env.CENSYS_APP_ID,
    greynoise: process.env.GREYNOISE_API_KEY,
    intelx: process.env.INTELX_API_KEY,
    openai: process.env.OPENAI_API_KEY,
  }
}

// Save API keys to Firestore
export async function saveApiKeys(userId: string, apiKeys: ApiKeys): Promise<void> {
  try {
    await setDoc(doc(db, "apiKeys", userId), apiKeys)
  } catch (error) {
    console.error("Error saving API keys to Firestore:", error)
    throw error
  }
}


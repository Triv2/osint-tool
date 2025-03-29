import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

// Generate AI analysis for OSINT data
export async function generateOsintAnalysis(query: string, queryType: string, results: any) {
  try {
    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: z.object({
        riskLevel: z.enum(["high", "medium", "low"]),
        summary: z.string(),
        keyFindings: z.array(z.string()),
        recommendedActions: z.array(z.string()),
      }),
      prompt: `Analyze the following OSINT data for ${queryType} "${query}" and provide a comprehensive risk assessment:
      ${JSON.stringify(results, null, 2)}
      
      Based on this data, determine the risk level (high, medium, or low), provide a summary of findings, list key findings as bullet points, and recommend actions to take.`,
    })

    return object
  } catch (error) {
    console.error("Error generating AI analysis:", error)
    throw error
  }
}

// Generate vector embeddings for similarity search
export async function generateEmbedding(text: string) {
  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        input: text,
        model: "text-embedding-3-small",
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to generate embedding")
    }

    return data.data[0].embedding
  } catch (error) {
    console.error("Error generating embedding:", error)
    throw error
  }
}


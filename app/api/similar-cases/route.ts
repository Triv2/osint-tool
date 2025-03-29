import { NextResponse } from "next/server"
import { findSimilarCases } from "@/lib/vector-db"
import { getCaseById } from "@/lib/firestore"

export async function POST(request: Request) {
  try {
    const { caseId, maxResults = 5 } = await request.json()

    if (!caseId) {
      return NextResponse.json({ error: "Case ID is required" }, { status: 400 })
    }

    // Get the case data
    const caseData = await getCaseById(caseId)

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Find similar cases using vector similarity
    const similarCases = await findSimilarCases(caseData, maxResults)

    return NextResponse.json({ similarCases })
  } catch (error) {
    console.error("Error finding similar cases:", error)
    return NextResponse.json({ error: "Failed to find similar cases" }, { status: 500 })
  }
}

// Add a semantic search endpoint
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")
    const maxResults = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 10

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    // Import here to avoid circular dependencies
    const { semanticSearch } = require("@/lib/vector-db")

    // Perform semantic search
    const results = await semanticSearch(query, maxResults)

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Error performing semantic search:", error)
    return NextResponse.json({ error: "Failed to perform semantic search" }, { status: 500 })
  }
}


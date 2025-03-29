import { NextResponse } from "next/server"
import { getCases, createCase, deleteCase } from "@/lib/firestore"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const options = {
      riskLevel: searchParams.get("riskLevel") || undefined,
      queryType: searchParams.get("queryType") || undefined,
      limit: searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined,
      orderByField: searchParams.get("orderBy") || undefined,
      orderDirection: (searchParams.get("order") as "asc" | "desc") || undefined,
      // In a real app, you'd get this from the authenticated user
      userId: "demo-user",
    }

    const cases = await getCases(options)

    return NextResponse.json({ cases })
  } catch (error) {
    console.error("Error fetching cases:", error)
    return NextResponse.json({ error: "Failed to fetch cases" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { query, queryType, results, aiAnalysis } = await request.json()

    if (!query || !queryType || !results || !aiAnalysis) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newCase = await createCase({
      title: generateCaseTitle(query, queryType),
      query,
      queryType,
      date: new Date().toISOString().split("T")[0],
      riskLevel: aiAnalysis.riskLevel,
      summary: aiAnalysis.summary,
      results,
      aiAnalysis,
      // In a real app, you'd get this from the authenticated user
      userId: "demo-user",
    })

    return NextResponse.json({
      success: true,
      case: newCase,
    })
  } catch (error) {
    console.error("Error creating case:", error)
    return NextResponse.json({ error: "Failed to create case" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get("id")

    if (!caseId) {
      return NextResponse.json({ error: "Case ID is required" }, { status: 400 })
    }

    await deleteCase(caseId)

    return NextResponse.json({
      success: true,
      message: "Case deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting case:", error)
    return NextResponse.json({ error: "Failed to delete case" }, { status: 500 })
  }
}

function generateCaseTitle(query: string, queryType: string) {
  const typeMap: Record<string, string> = {
    ip: "IP Address Analysis",
    domain: "Domain Investigation",
    email: "Email Breach Check",
    hash: "File Hash Analysis",
  }

  const baseTitle = typeMap[queryType] || "OSINT Investigation"
  return `${baseTitle}: ${query}`
}


import { NextResponse } from "next/server"
import { generateOsintAnalysis } from "@/lib/openai"
import { createCase } from "@/lib/firestore"
import { OsintFactory } from "@/lib/api/osint-factory"

export async function POST(request: Request) {
  try {
    const { query, queryType, saveAsCase } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    // Get results from OSINT APIs
    const results = await fetchOsintData(query, queryType)

    // Generate AI analysis based on the collected data
    const aiAnalysis = await generateOsintAnalysis(query, queryType, results)

    // Save as case if requested
    let caseData = null
    if (saveAsCase) {
      caseData = await createCase({
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
    }

    return NextResponse.json({
      query,
      queryType,
      results,
      aiAnalysis,
      case: caseData,
    })
  } catch (error) {
    console.error("Error processing OSINT request:", error)
    return NextResponse.json({ error: "Failed to process OSINT request" }, { status: 500 })
  }
}

async function fetchOsintData(query: string, queryType: string) {
  // In a production app, you would get these from environment variables or a secure store
  const apiKeys = {
    shodan: process.env.SHODAN_API_KEY || "",
    virustotal: process.env.VIRUSTOTAL_API_KEY || "",
    hibp: process.env.HIBP_API_KEY || "",
    censysId: process.env.CENSYS_API_ID || "",
    censysSecret: process.env.CENSYS_API_SECRET || "",
    greynoise: process.env.GREYNOISE_API_KEY || "",
    intelx: process.env.INTELX_API_KEY || "",
  }

  const factory = OsintFactory.getInstance()
  const results: any = {}

  try {
    // Parallel requests to different OSINT services
    const requests = []

    // Shodan (for IPs and domains)
    if ((queryType === "ip" || queryType === "domain" || queryType === "auto") && apiKeys.shodan) {
      const shodanClient = factory.getShodanClient(apiKeys.shodan)
      requests.push(
        shodanClient
          .search(query)
          .then((data) => {
            results.shodan = data
          })
          .catch((err) => {
            results.shodan = { error: err.message }
          }),
      )
    }

    // VirusTotal (for domains, IPs, URLs, and file hashes)
    if (apiKeys.virustotal) {
      const vtClient = factory.getVirusTotalClient(apiKeys.virustotal)
      let vtPromise

      switch (queryType) {
        case "domain":
          vtPromise = vtClient.getDomainReport(query)
          break
        case "ip":
          vtPromise = vtClient.getIpReport(query)
          break
        case "url":
          vtPromise = vtClient.getUrlReport(query)
          break
        case "hash":
          vtPromise = vtClient.getDetails(query)
          break
        default:
          // Try to auto-detect
          if (/^([a-f0-9]{32}|[a-f0-9]{40}|[a-f0-9]{64})$/i.test(query)) {
            vtPromise = vtClient.getDetails(query) // Hash
          } else if (/^(https?:\/\/)/i.test(query)) {
            vtPromise = vtClient.getUrlReport(query) // URL
          } else if (/^(\d{1,3}\.){3}\d{1,3}$/.test(query)) {
            vtPromise = vtClient.getIpReport(query) // IP
          } else if (/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(query)) {
            vtPromise = vtClient.getDomainReport(query) // Domain
          }
      }

      if (vtPromise) {
        requests.push(
          vtPromise
            .then((data) => {
              results.virustotal = data
            })
            .catch((err) => {
              results.virustotal = { error: err.message }
            }),
        )
      }
    }

    // Have I Been Pwned (for emails and domains)
    if ((queryType === "email" || queryType === "domain" || queryType === "auto") && apiKeys.hibp) {
      const hibpClient = factory.getHaveIBeenPwnedClient(apiKeys.hibp)

      if (queryType === "email" || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(query)) {
        // Email
        requests.push(
          hibpClient
            .search(query)
            .then((data) => {
              results.hibp = { breaches: data }
            })
            .catch((err) => {
              results.hibp = { error: err.message }
            }),
        )

        requests.push(
          hibpClient
            .getPastes(query)
            .then((data) => {
              if (!results.hibp) results.hibp = {}
              results.hibp.pastes = data
            })
            .catch((err) => {
              if (!results.hibp) results.hibp = {}
              results.hibp.pastesError = err.message
            }),
        )
      } else if (queryType === "domain" || /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(query)) {
        // Domain
        requests.push(
          hibpClient
            .getBreachesForDomain(query)
            .then((data) => {
              results.hibp = { domainBreaches: data }
            })
            .catch((err) => {
              results.hibp = { error: err.message }
            }),
        )
      }
    }

    // Censys (for IPs and domains)
    if (
      (queryType === "ip" || queryType === "domain" || queryType === "auto") &&
      apiKeys.censysId &&
      apiKeys.censysSecret
    ) {
      const censysClient = factory.getCensysClient(apiKeys.censysId, apiKeys.censysSecret)

      requests.push(
        censysClient
          .search(query)
          .then((data) => {
            results.censys = data
          })
          .catch((err) => {
            results.censys = { error: err.message }
          }),
      )

      if (queryType === "ip" || /^(\d{1,3}\.){3}\d{1,3}$/.test(query)) {
        requests.push(
          censysClient
            .getView(query)
            .then((data) => {
              if (!results.censys) results.censys = {}
              results.censys.details = data
            })
            .catch((err) => {
              if (!results.censys) results.censys = {}
              results.censys.detailsError = err.message
            }),
        )
      }
    }

    // GreyNoise (for IPs)
    if ((queryType === "ip" || queryType === "auto") && apiKeys.greynoise) {
      const greynoiseClient = factory.getGreyNoiseClient(apiKeys.greynoise)

      if (queryType === "ip" || /^(\d{1,3}\.){3}\d{1,3}$/.test(query)) {
        requests.push(
          greynoiseClient
            .getDetails(query)
            .then((data) => {
              results.greynoise = data
            })
            .catch((err) => {
              results.greynoise = { error: err.message }
            }),
        )
      } else {
        requests.push(
          greynoiseClient
            .search(query)
            .then((data) => {
              results.greynoise = data
            })
            .catch((err) => {
              results.greynoise = { error: err.message }
            }),
        )
      }
    }

    // Intelligence X (for various data types)
    if (apiKeys.intelx) {
      const intelxClient = factory.getIntelligenceXClient(apiKeys.intelx)

      requests.push(
        intelxClient
          .search(query)
          .then((data) => {
            results.intelx = data
          })
          .catch((err) => {
            results.intelx = { error: err.message }
          }),
      )

      if (queryType === "email" || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(query)) {
        requests.push(
          intelxClient
            .getEmailIntelligence(query)
            .then((data) => {
              if (!results.intelx) results.intelx = {}
              results.intelx.emailData = data
            })
            .catch((err) => {
              if (!results.intelx) results.intelx = {}
              results.intelx.emailError = err.message
            }),
        )
      }
    }

    // Wait for all requests to complete
    await Promise.all(requests)

    return results
  } catch (error) {
    console.error("Error fetching OSINT data:", error)
    // Return partial results if available
    return { ...results, error: "Some OSINT sources failed to respond" }
  }
}

function generateCaseTitle(query: string, queryType: string) {
  const typeMap: Record<string, string> = {
    ip: "IP Address Analysis",
    domain: "Domain Investigation",
    email: "Email Breach Check",
    hash: "File Hash Analysis",
    url: "URL Analysis",
  }

  const baseTitle = typeMap[queryType] || "OSINT Investigation"
  return `${baseTitle}: ${query}`
}


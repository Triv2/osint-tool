import { ShodanClient } from "./shodan-client"
import { VirusTotalClient } from "./virustotal-client"
import { HaveIBeenPwnedClient } from "./hibp-client"
import { CensysClient } from "./censys-client"
import { GreyNoiseClient } from "./greynoise-client"
import { IntelligenceXClient } from "./intelx-client"

export class OsintService {
  private shodanClient?: ShodanClient
  private virusTotalClient?: VirusTotalClient
  private hibpClient?: HaveIBeenPwnedClient
  private censysClient?: CensysClient
  private greyNoiseClient?: GreyNoiseClient
  private intelXClient?: IntelligenceXClient

  constructor(apiKeys: {
    shodan?: string
    virustotal?: string
    hibp?: string
    censysApiKey?: string
    censysAppId?: string
    greynoise?: string
    intelx?: string
  }) {
    if (apiKeys.shodan) {
      this.shodanClient = new ShodanClient(apiKeys.shodan)
    }

    if (apiKeys.virustotal) {
      this.virusTotalClient = new VirusTotalClient(apiKeys.virustotal)
    }

    if (apiKeys.hibp) {
      this.hibpClient = new HaveIBeenPwnedClient(apiKeys.hibp)
    }

    if (apiKeys.censysApiKey && apiKeys.censysAppId) {
      this.censysClient = new CensysClient(apiKeys.censysApiKey, apiKeys.censysAppId)
    }

    if (apiKeys.greynoise) {
      this.greyNoiseClient = new GreyNoiseClient(apiKeys.greynoise)
    }

    if (apiKeys.intelx) {
      this.intelXClient = new IntelligenceXClient(apiKeys.intelx)
    }
  }

  async searchAll(query: string, queryType: string): Promise<Record<string, any>> {
    const results: Record<string, any> = {}
    const promises: Promise<void>[] = []

    // Determine which services to query based on query type
    if (this.shodanClient && (queryType === "ip" || queryType === "domain" || queryType === "auto")) {
      promises.push(
        this.shodanClient
          .search(query)
          .then((data) => {
            results.shodan = data
          })
          .catch((error) => {
            results.shodan = { error: error.message }
          }),
      )
    }

    if (this.virusTotalClient) {
      let vtPromise

      switch (queryType) {
        case "ip":
          vtPromise = this.virusTotalClient.getIP(query)
          break
        case "domain":
          vtPromise = this.virusTotalClient.getDomain(query)
          break
        case "url":
          vtPromise = this.virusTotalClient.getUrl(query)
          break
        case "hash":
          vtPromise = this.virusTotalClient.getFile(query)
          break
        default:
          vtPromise = this.virusTotalClient.search(query)
      }

      promises.push(
        vtPromise
          .then((data) => {
            results.virustotal = data
          })
          .catch((error) => {
            results.virustotal = { error: error.message }
          }),
      )
    }

    if (this.hibpClient && (queryType === "email" || queryType === "auto")) {
      promises.push(
        this.hibpClient
          .search(query)
          .then((data) => {
            results.hibp = data
          })
          .catch((error) => {
            results.hibp = { error: error.message }
          }),
      )
    }

    if (this.censysClient && (queryType === "ip" || queryType === "domain" || queryType === "auto")) {
      promises.push(
        this.censysClient
          .search(query)
          .then((data) => {
            results.censys = data
          })
          .catch((error) => {
            results.censys = { error: error.message }
          }),
      )
    }

    if (this.greyNoiseClient && (queryType === "ip" || queryType === "auto")) {
      promises.push(
        this.greyNoiseClient
          .getIP(query)
          .then((data) => {
            results.greynoise = data
          })
          .catch((error) => {
            results.greynoise = { error: error.message }
          }),
      )
    }

    if (this.intelXClient) {
      promises.push(
        this.intelXClient
          .search(query)
          .then((data) => {
            results.intelx = data
          })
          .catch((error) => {
            results.intelx = { error: error.message }
          }),
      )
    }

    // Wait for all promises to resolve
    await Promise.all(promises)
    return results
  }

  // Helper method to detect query type
  static detectQueryType(query: string): string {
    // IP address regex
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/

    // Domain regex
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i

    // Email regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    // URL regex
    const urlRegex =
      /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/

    // Hash regex (MD5, SHA1, SHA256)
    const md5Regex = /^[a-f0-9]{32}$/i
    const sha1Regex = /^[a-f0-9]{40}$/i
    const sha256Regex = /^[a-f0-9]{64}$/i

    if (ipRegex.test(query)) {
      return "ip"
    } else if (domainRegex.test(query)) {
      return "domain"
    } else if (emailRegex.test(query)) {
      return "email"
    } else if (urlRegex.test(query)) {
      return "url"
    } else if (md5Regex.test(query) || sha1Regex.test(query) || sha256Regex.test(query)) {
      return "hash"
    }

    return "unknown"
  }
}


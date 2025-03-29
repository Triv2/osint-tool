import { ShodanClient } from "./shodan-client"
import { VirusTotalClient } from "./virustotal-client"
import { HaveIBeenPwnedClient } from "./hibp-client"
import { CensysClient } from "./censys-client"
import { GreyNoiseClient } from "./greynoise-client"
import { IntelligenceXClient } from "./intelx-client"

// Singleton factory for OSINT clients
export class OsintFactory {
  private static instance: OsintFactory
  private clients: Map<string, any> = new Map()

  private constructor() {}

  public static getInstance(): OsintFactory {
    if (!OsintFactory.instance) {
      OsintFactory.instance = new OsintFactory()
    }
    return OsintFactory.instance
  }

  public getShodanClient(apiKey: string): ShodanClient {
    if (!this.clients.has("shodan")) {
      this.clients.set("shodan", new ShodanClient(apiKey))
    }
    return this.clients.get("shodan")
  }

  public getVirusTotalClient(apiKey: string): VirusTotalClient {
    if (!this.clients.has("virustotal")) {
      this.clients.set("virustotal", new VirusTotalClient(apiKey))
    }
    return this.clients.get("virustotal")
  }

  public getHaveIBeenPwnedClient(apiKey: string): HaveIBeenPwnedClient {
    if (!this.clients.has("hibp")) {
      this.clients.set("hibp", new HaveIBeenPwnedClient(apiKey))
    }
    return this.clients.get("hibp")
  }

  public getCensysClient(apiId: string, apiSecret: string): CensysClient {
    if (!this.clients.has("censys")) {
      this.clients.set("censys", new CensysClient(apiId, apiSecret))
    }
    return this.clients.get("censys")
  }

  public getGreyNoiseClient(apiKey: string): GreyNoiseClient {
    if (!this.clients.has("greynoise")) {
      this.clients.set("greynoise", new GreyNoiseClient(apiKey))
    }
    return this.clients.get("greynoise")
  }

  public getIntelligenceXClient(apiKey: string): IntelligenceXClient {
    if (!this.clients.has("intelx")) {
      this.clients.set("intelx", new IntelligenceXClient(apiKey))
    }
    return this.clients.get("intelx")
  }
}


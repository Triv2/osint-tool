import { OsintClient } from "./osint-client"

export class HaveIBeenPwnedClient extends OsintClient {
  constructor(apiKey: string) {
    super(apiKey, "https://haveibeenpwned.com/api/v3", 10)
  }

  async search(email: string): Promise<any> {
    return this.makeRequest(`/breachedaccount/${encodeURIComponent(email)}`, {
      headers: {
        "hibp-api-key": this.apiKey,
        "User-Agent": "OSINT Intelligence Framework",
      },
    })
  }

  async getDetails(breach: string): Promise<any> {
    return this.makeRequest(`/breach/${encodeURIComponent(breach)}`, {
      headers: {
        "hibp-api-key": this.apiKey,
        "User-Agent": "OSINT Intelligence Framework",
      },
    })
  }

  async getAllBreaches(): Promise<any> {
    return this.makeRequest("/breaches", {
      headers: {
        "hibp-api-key": this.apiKey,
        "User-Agent": "OSINT Intelligence Framework",
      },
    })
  }

  async getBreachesForDomain(domain: string): Promise<any> {
    return this.makeRequest(`/breaches?domain=${encodeURIComponent(domain)}`, {
      headers: {
        "hibp-api-key": this.apiKey,
        "User-Agent": "OSINT Intelligence Framework",
      },
    })
  }

  async getPastes(email: string): Promise<any> {
    return this.makeRequest(`/pasteaccount/${encodeURIComponent(email)}`, {
      headers: {
        "hibp-api-key": this.apiKey,
        "User-Agent": "OSINT Intelligence Framework",
      },
    })
  }
}


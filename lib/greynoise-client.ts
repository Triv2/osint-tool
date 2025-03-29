import { OsintClient } from "./osint-client"

export class GreyNoiseClient extends OsintClient {
  constructor(apiKey: string) {
    super(apiKey, "https://api.greynoise.io/v3", 60)
  }

  async search(query: string): Promise<any> {
    return this.makeRequest("/experimental/gnql", {
      method: "POST",
      headers: {
        key: this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    })
  }

  async getDetails(ip: string): Promise<any> {
    return this.makeRequest(`/community/${ip}`, {
      headers: {
        key: this.apiKey,
      },
    })
  }

  async getQuickCheck(ip: string): Promise<any> {
    return this.makeRequest(`/noise/quick/${ip}`, {
      headers: {
        key: this.apiKey,
      },
    })
  }

  async getRiotCheck(ip: string): Promise<any> {
    return this.makeRequest(`/riot/${ip}`, {
      headers: {
        key: this.apiKey,
      },
    })
  }

  async getMultiQuickCheck(ips: string[]): Promise<any> {
    return this.makeRequest("/noise/multi/quick", {
      method: "POST",
      headers: {
        key: this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ips }),
    })
  }
}


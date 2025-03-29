import { OsintClient } from "./osint-client"

export class CensysClient extends OsintClient {
  private apiSecret: string

  constructor(apiId: string, apiSecret: string) {
    super(apiId, "https://search.censys.io/api", 120) // 120 requests per 5 minutes
    this.apiSecret = apiSecret
  }

  private getAuthHeader(): string {
    return "Basic " + Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString("base64")
  }

  async search(query: string): Promise<any> {
    return this.makeRequest("/v2/hosts/search", {
      method: "POST",
      headers: {
        Authorization: this.getAuthHeader(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ q: query }),
    })
  }

  async getDetails(ip: string): Promise<any> {
    return this.makeRequest(`/v2/hosts/${ip}`, {
      headers: {
        Authorization: this.getAuthHeader(),
        Accept: "application/json",
      },
    })
  }

  async getCertificates(query: string): Promise<any> {
    return this.makeRequest("/v1/search/certificates", {
      method: "POST",
      headers: {
        Authorization: this.getAuthHeader(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query }),
    })
  }

  async getView(ip: string): Promise<any> {
    return this.makeRequest(`/v1/view/ipv4/${ip}`, {
      headers: {
        Authorization: this.getAuthHeader(),
        Accept: "application/json",
      },
    })
  }
}


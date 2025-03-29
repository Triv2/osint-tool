import { OsintClient } from "./osint-client"

export class VirusTotalClient extends OsintClient {
  constructor(apiKey: string) {
    super(apiKey, "https://www.virustotal.com/api/v3", 4) // 4 requests per minute for free tier
  }

  async search(query: string): Promise<any> {
    return this.makeRequest("/intelligence/search", {
      method: "POST",
      headers: {
        "x-apikey": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    })
  }

  async getDetails(id: string): Promise<any> {
    return this.makeRequest(`/files/${id}`, {
      headers: {
        "x-apikey": this.apiKey,
      },
    })
  }

  async getDomainReport(domain: string): Promise<any> {
    return this.makeRequest(`/domains/${domain}`, {
      headers: {
        "x-apikey": this.apiKey,
      },
    })
  }

  async getIpReport(ip: string): Promise<any> {
    return this.makeRequest(`/ip_addresses/${ip}`, {
      headers: {
        "x-apikey": this.apiKey,
      },
    })
  }

  async getUrlReport(url: string): Promise<any> {
    const encodedUrl = encodeURIComponent(url)
    return this.makeRequest(`/urls/${encodedUrl}`, {
      headers: {
        "x-apikey": this.apiKey,
      },
    })
  }

  async scanUrl(url: string): Promise<any> {
    return this.makeRequest("/urls", {
      method: "POST",
      headers: {
        "x-apikey": this.apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `url=${encodeURIComponent(url)}`,
    })
  }
}


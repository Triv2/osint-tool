import { OsintClient } from "./osint-client"

export class ShodanClient extends OsintClient {
  constructor(apiKey: string) {
    super(apiKey, "https://api.shodan.io", 10) // Shodan has a lower rate limit
  }

  async search(query: string): Promise<any> {
    return this.makeRequest(`/shodan/host/search?key=${this.apiKey}&query=${encodeURIComponent(query)}`)
  }

  async getDetails(ip: string): Promise<any> {
    return this.makeRequest(`/shodan/host/${ip}?key=${this.apiKey}`)
  }

  async getDnsResolve(hostnames: string[]): Promise<any> {
    return this.makeRequest(`/dns/resolve?key=${this.apiKey}&hostnames=${hostnames.join(",")}`)
  }

  async getDnsReverse(ips: string[]): Promise<any> {
    return this.makeRequest(`/dns/reverse?key=${this.apiKey}&ips=${ips.join(",")}`)
  }

  async getPortsInfo(): Promise<any> {
    return this.makeRequest(`/shodan/ports?key=${this.apiKey}`)
  }

  async getMyIp(): Promise<any> {
    return this.makeRequest(`/tools/myip?key=${this.apiKey}`)
  }

  async getApiInfo(): Promise<any> {
    return this.makeRequest(`/api-info?key=${this.apiKey}`)
  }
}


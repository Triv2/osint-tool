import { OsintClient } from "./osint-client"

export class IntelligenceXClient extends OsintClient {
  constructor(apiKey: string) {
    super(apiKey, "https://2.intelx.io", 30)
  }

  async search(query: string): Promise<any> {
    // First, create a search
    const searchResponse = await this.makeRequest("/intelligent/search", {
      method: "POST",
      headers: {
        "x-key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        term: query,
        maxresults: 10,
        media: 0,
        sort: 2,
        terminate: [],
      }),
    })

    // Then, get the results
    const id = searchResponse.id
    return this.makeRequest(`/intelligent/search/result?id=${id}`, {
      headers: {
        "x-key": this.apiKey,
      },
    })
  }

  async getDetails(id: string): Promise<any> {
    return this.makeRequest(`/intelligent/search/result?id=${id}&status=1`, {
      headers: {
        "x-key": this.apiKey,
      },
    })
  }

  async getFile(fileId: string, bucketId: string): Promise<any> {
    return this.makeRequest(`/intelligent/files/view?f=${fileId}&b=${bucketId}&k=${this.apiKey}`)
  }

  async getPhoneIntelligence(phoneNumber: string): Promise<any> {
    return this.makeRequest(`/phonebook/search?term=${encodeURIComponent(phoneNumber)}`, {
      headers: {
        "x-key": this.apiKey,
      },
    })
  }

  async getEmailIntelligence(email: string): Promise<any> {
    return this.makeRequest(`/phonebook/search?term=${encodeURIComponent(email)}`, {
      headers: {
        "x-key": this.apiKey,
      },
    })
  }
}


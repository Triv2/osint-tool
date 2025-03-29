export abstract class OsintClient {
  protected apiKey: string
  protected baseUrl: string
  protected rateLimit: number // requests per minute
  private requestTimestamps: number[] = []

  constructor(apiKey: string, baseUrl: string, rateLimit = 60) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
    this.rateLimit = rateLimit
  }

  // Check if we're within rate limits
  protected checkRateLimit(): boolean {
    const now = Date.now()
    // Remove timestamps older than 1 minute
    this.requestTimestamps = this.requestTimestamps.filter((timestamp) => now - timestamp < 60000)

    return this.requestTimestamps.length < this.rateLimit
  }

  // Record a request timestamp
  protected recordRequest(): void {
    this.requestTimestamps.push(Date.now())
  }

  // Make a rate-limited API request
  protected async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.checkRateLimit()) {
      throw new Error("Rate limit exceeded. Please try again later.")
    }

    try {
      this.recordRequest()
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API request failed: ${response.status} - ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("API request error:", error)
      throw error
    }
  }

  // Abstract methods that each client must implement
  abstract search(query: string): Promise<any>
  abstract getDetails(id: string): Promise<any>
}


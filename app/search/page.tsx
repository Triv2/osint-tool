"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchResults } from "@/components/search-results"
import { Loader2, Search, Save } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [queryType, setQueryType] = useState("auto")
  const [isLoading, setIsLoading] = useState(false)
  const [hasResults, setHasResults] = useState(false)
  const [saveAsCase, setSaveAsCase] = useState(true)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setHasResults(true)
    }, 2000)
  }

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">OSINT Search</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Intelligence Sources</CardTitle>
          <CardDescription>Enter an IP address, domain, email, or file hash to gather intelligence</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter IP, domain, email, or hash..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={queryType} onValueChange={setQueryType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Query Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-detect</SelectItem>
                    <SelectItem value="ip">IP Address</SelectItem>
                    <SelectItem value="domain">Domain</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="hash">File Hash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isLoading || !query.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="save-case" checked={saveAsCase} onCheckedChange={setSaveAsCase} />
              <Label htmlFor="save-case">Save results as a case</Label>
            </div>
          </form>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className={hasResults ? "block" : "hidden"}>
        <TabsList>
          <TabsTrigger value="all">All Results</TabsTrigger>
          <TabsTrigger value="shodan">Shodan</TabsTrigger>
          <TabsTrigger value="virustotal">VirusTotal</TabsTrigger>
          <TabsTrigger value="hibp">Have I Been Pwned</TabsTrigger>
          <TabsTrigger value="censys">Censys</TabsTrigger>
          <TabsTrigger value="greynoise">GreyNoise</TabsTrigger>
          <TabsTrigger value="intelx">Intelligence X</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <SearchResults />
        </TabsContent>
        <TabsContent value="shodan">
          <SearchResults source="shodan" />
        </TabsContent>
        <TabsContent value="virustotal">
          <SearchResults source="virustotal" />
        </TabsContent>
        <TabsContent value="hibp">
          <SearchResults source="hibp" />
        </TabsContent>
        <TabsContent value="censys">
          <SearchResults source="censys" />
        </TabsContent>
        <TabsContent value="greynoise">
          <SearchResults source="greynoise" />
        </TabsContent>
        <TabsContent value="intelx">
          <SearchResults source="intelx" />
        </TabsContent>
      </Tabs>

      {hasResults && (
        <div className="flex justify-end">
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save as Case
          </Button>
        </div>
      )}
    </div>
  )
}


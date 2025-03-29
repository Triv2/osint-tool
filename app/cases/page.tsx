"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Loader2 } from "lucide-react"
import Link from "next/link"
import { CaseList } from "@/components/case-list"
import { subscribeToCasesList } from "@/lib/realtime"
import type { Case } from "@/lib/firestore"
import { useAuth } from "@/components/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"

export default function CasesPage() {
  return (
    <ProtectedRoute>
      <CasesContent />
    </ProtectedRoute>
  )
}

function CasesContent() {
  const { user } = useAuth()
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [riskLevel, setRiskLevel] = useState("all")
  const [queryType, setQueryType] = useState("all")

  useEffect(() => {
    if (!user) return

    // Subscribe to real-time updates for cases
    const unsubscribe = subscribeToCasesList(
      {
        userId: user.uid,
        riskLevel: riskLevel !== "all" ? riskLevel : undefined,
        queryType: queryType !== "all" ? queryType : undefined,
      },
      (casesData) => {
        setLoading(false)
        setCases(casesData)
      },
    )

    return () => {
      unsubscribe()
    }
  }, [user, riskLevel, queryType])

  // Filter cases by search term
  const filteredCases = cases.filter((caseItem) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    return (
      caseItem.title.toLowerCase().includes(searchLower) ||
      caseItem.query.toLowerCase().includes(searchLower) ||
      caseItem.summary.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Cases</h1>
        <Button asChild>
          <Link href="/search">
            <Search className="mr-2 h-4 w-4" />
            New Search
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Case Management</CardTitle>
          <CardDescription>View and manage your saved OSINT investigations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <Input placeholder="Search cases..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="w-full md:w-48">
              <Select value={riskLevel} onValueChange={setRiskLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={queryType} onValueChange={setQueryType}>
                <SelectTrigger>
                  <SelectValue placeholder="Query Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ip">IP Address</SelectItem>
                  <SelectItem value="domain">Domain</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="hash">File Hash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <CaseList cases={filteredCases} />
      )}
    </div>
  )
}


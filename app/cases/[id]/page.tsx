"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, Download, Edit, AlertTriangle, Shield, FileText, Link2 } from "lucide-react"
import Link from "next/link"
import { SearchResults } from "@/components/search-results"
import { ActivityLogComponent } from "@/components/activity-log"
import { subscribeToCase } from "@/lib/realtime"
import { findSimilarCases } from "@/lib/vector-db"

export default function CaseDetailPage({ params }: { params: { id: string } }) {
  const [caseData, setCaseData] = useState<any>(null)
  const [similarCases, setSimilarCases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Subscribe to real-time case updates
    const unsubscribe = subscribeToCase(params.id, (data) => {
      setCaseData(data)
      setLoading(false)

      // Find similar cases
      if (data) {
        findSimilarCases(data, 2)
          .then((similar) => {
            setSimilarCases(similar)
          })
          .catch((err) => {
            console.error("Error finding similar cases:", err)
          })
      }
    })

    return () => unsubscribe()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex flex-col p-6 space-y-6">
        <div className="flex items-center">
          <Button asChild variant="ghost" size="sm" className="mr-4">
            <Link href="/cases">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cases
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Loading case...</h1>
        </div>
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="flex flex-col p-6 space-y-6">
        <div className="flex items-center">
          <Button asChild variant="ghost" size="sm" className="mr-4">
            <Link href="/cases">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cases
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Case not found</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Case Not Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              The case you are looking for does not exist or has been deleted.
            </p>
            <Button asChild>
              <Link href="/cases">View All Cases</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center">
        <Button asChild variant="ghost" size="sm" className="mr-4">
          <Link href="/cases">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cases
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{caseData.title}</h1>
        <Badge
          variant={
            caseData.riskLevel === "high" ? "destructive" : caseData.riskLevel === "medium" ? "default" : "outline"
          }
          className={`ml-4 ${caseData.riskLevel === "medium" ? "bg-amber-500" : caseData.riskLevel === "low" ? "text-green-500 border-green-500" : ""}`}
        >
          {caseData.riskLevel.charAt(0).toUpperCase() + caseData.riskLevel.slice(1)} Risk
        </Badge>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-2/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Case Summary</CardTitle>
              <CardDescription className="flex items-center">
                <span className="font-mono">{caseData.query}</span>
                <span className="mx-2">•</span>
                <Calendar className="h-3 w-3 mr-1" />
                {caseData.date}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert
                className={`mb-4 ${
                  caseData.riskLevel === "high"
                    ? "border-destructive"
                    : caseData.riskLevel === "medium"
                      ? "border-amber-500"
                      : "border-green-500"
                }`}
              >
                <AlertTriangle
                  className={`h-4 w-4 ${
                    caseData.riskLevel === "high"
                      ? "text-destructive"
                      : caseData.riskLevel === "medium"
                        ? "text-amber-500"
                        : "text-green-500"
                  }`}
                />
                <AlertTitle className="capitalize">{caseData.riskLevel} Risk Assessment</AlertTitle>
                <AlertDescription>{caseData.summary}</AlertDescription>
              </Alert>

              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Investigator Notes:</h4>
                <p className="text-sm whitespace-pre-line">{caseData.notes || "No notes added yet."}</p>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Tags:</h4>
                <div className="flex flex-wrap gap-2">
                  {caseData.tags && caseData.tags.length > 0 ? (
                    caseData.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No tags added</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Case
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="results">
            <TabsList>
              <TabsTrigger value="results">OSINT Results</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
            </TabsList>
            <TabsContent value="results">
              <SearchResults source={caseData.results} />
            </TabsContent>
            <TabsContent value="timeline">
              <Card>
                <CardContent className="pt-6">
                  <div className="relative border-l border-border pl-6 pb-2">
                    <div className="absolute left-0 top-0 flex items-center justify-center -translate-x-1/2 rounded-full bg-background border border-border p-1">
                      <div className="h-2 w-2 rounded-full bg-destructive"></div>
                    </div>
                    <div className="mb-6">
                      <h4 className="text-sm font-medium">Case Created</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(caseData.createdAt?.toDate()).toLocaleString()}
                      </p>
                      <p className="text-sm mt-1">
                        Initial investigation opened based on threat intelligence feed alert
                      </p>
                    </div>
                  </div>

                  <div className="relative border-l border-border pl-6 pb-2">
                    <div className="absolute left-0 top-0 flex items-center justify-center -translate-x-1/2 rounded-full bg-background border border-border p-1">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    </div>
                    <div className="mb-6">
                      <h4 className="text-sm font-medium">OSINT Data Collected</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(caseData.createdAt?.toDate()).toLocaleString()}
                      </p>
                      <p className="text-sm mt-1">
                        Automated collection from Shodan, VirusTotal, HIBP, Censys, GreyNoise, and IntelX
                      </p>
                    </div>
                  </div>

                  <div className="relative border-l border-border pl-6 pb-2">
                    <div className="absolute left-0 top-0 flex items-center justify-center -translate-x-1/2 rounded-full bg-background border border-border p-1">
                      <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                    </div>
                    <div className="mb-6">
                      <h4 className="text-sm font-medium">AI Analysis Completed</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(caseData.createdAt?.toDate()).toLocaleString()}
                      </p>
                      <p className="text-sm mt-1">
                        AI risk assessment determined {caseData.riskLevel.toUpperCase()} risk level based on aggregated
                        data
                      </p>
                    </div>
                  </div>

                  {caseData.updatedAt && (
                    <div className="relative border-l border-border pl-6">
                      <div className="absolute left-0 top-0 flex items-center justify-center -translate-x-1/2 rounded-full bg-background border border-border p-1">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Case Updated</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(caseData.updatedAt?.toDate()).toLocaleString()}
                        </p>
                        <p className="text-sm mt-1">Case details were updated</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="artifacts">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Domain Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm p-2 rounded-md bg-muted">
                          <span>Registration Date</span>
                          <span>2023-03-01</span>
                        </div>
                        <div className="flex items-center justify-between text-sm p-2 rounded-md bg-muted">
                          <span>Registrar</span>
                          <span>NameCheap, Inc.</span>
                        </div>
                        <div className="flex items-center justify-between text-sm p-2 rounded-md bg-muted">
                          <span>Name Servers</span>
                          <span>ns1.digitalocean.com, ns2.digitalocean.com</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="text-sm font-medium mb-2">Associated IPs</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm p-2 rounded-md bg-muted">
                          <span>104.131.72.149</span>
                          <Badge variant="outline">Primary</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm p-2 rounded-md bg-muted">
                          <span>104.131.73.237</span>
                          <Badge variant="outline">Secondary</Badge>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="text-sm font-medium mb-2">SSL Certificate</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm p-2 rounded-md bg-muted">
                          <span>Issuer</span>
                          <span>Let's Encrypt Authority X3</span>
                        </div>
                        <div className="flex items-center justify-between text-sm p-2 rounded-md bg-muted">
                          <span>Valid From</span>
                          <span>2023-03-02</span>
                        </div>
                        <div className="flex items-center justify-between text-sm p-2 rounded-md bg-muted">
                          <span>Valid To</span>
                          <span>2023-06-02</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="activity">
              <ActivityLogComponent caseId={params.id} limit={20} showFilters={false} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="w-full md:w-1/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-primary" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Key Risk Indicators</h4>
                  <ul className="space-y-1">
                    {caseData.aiAnalysis?.keyFindings ? (
                      caseData.aiAnalysis.keyFindings.map((finding: string, index: number) => (
                        <li key={index} className="text-sm flex items-start">
                          <span
                            className={`mr-2 ${
                              caseData.riskLevel === "high"
                                ? "text-destructive"
                                : caseData.riskLevel === "medium"
                                  ? "text-amber-500"
                                  : "text-green-500"
                            }`}
                          >
                            •
                          </span>
                          {finding}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm">No key findings available</li>
                    )}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-1">Recommended Actions</h4>
                  <ul className="space-y-1">
                    {caseData.aiAnalysis?.recommendedActions ? (
                      caseData.aiAnalysis.recommendedActions.map((action: string, index: number) => (
                        <li key={index} className="text-sm flex items-start">
                          <span className="mr-2 text-primary">•</span>
                          {action}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm">No recommended actions available</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Link2 className="mr-2 h-5 w-5 text-primary" />
                Similar Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              {similarCases.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No similar cases found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {similarCases.map((similar) => (
                    <div key={similar.caseId} className="p-3 rounded-md border">
                      <Link href={`/cases/${similar.caseId}`} className="text-sm font-medium hover:underline">
                        {similar.metadata.title}
                      </Link>
                      <div className="flex items-center mt-1">
                        <Badge
                          variant={
                            similar.metadata.riskLevel === "high"
                              ? "destructive"
                              : similar.metadata.riskLevel === "medium"
                                ? "default"
                                : "outline"
                          }
                          className={`${
                            similar.metadata.riskLevel === "medium"
                              ? "bg-amber-500"
                              : similar.metadata.riskLevel === "low"
                                ? "text-green-500 border-green-500"
                                : ""
                          }`}
                        >
                          {similar.metadata.riskLevel.charAt(0).toUpperCase() + similar.metadata.riskLevel.slice(1)}
                        </Badge>
                        <span className="mx-2 text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{similar.metadata.date}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Similarity: {Math.round(similar.score * 100)}%
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Similar Threats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 rounded-md border">
                  <h4 className="text-sm font-medium">Financial Phishing Campaign</h4>
                  <p className="text-xs text-muted-foreground mt-1">Active campaign targeting banking customers</p>
                </div>
                <div className="p-3 rounded-md border">
                  <h4 className="text-sm font-medium">Credential Harvesting Operation</h4>
                  <p className="text-xs text-muted-foreground mt-1">Similar infrastructure and tactics observed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


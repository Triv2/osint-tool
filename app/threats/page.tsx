"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NetworkGraph } from "@/components/network-graph"
import { ActivityHeatmap } from "@/components/activity-heatmap"
import { ThreatInsights } from "@/components/threat-insights"
import { AlertTriangle, BarChart3, Globe, Calendar, TrendingUp } from "lucide-react"

export default function ThreatIntelligencePage() {
  const [timeRange, setTimeRange] = useState("30d")

  // Sample data for network graph
  const graphNodes = [
    { id: "case-001", label: "Case 1", type: "case", size: 30 },
    { id: "domain-1", label: "Domain 1", type: "domain" },
    { id: "domain-2", label: "Domain 2", type: "domain" },
    { id: "ip-1", label: "IP 1", type: "ip" },
    { id: "ip-2", label: "IP 2", type: "ip" },
    { id: "email-1", label: "Email 1", type: "email" },
    { id: "hash-1", label: "Hash 1", type: "hash" },
  ]

  const graphEdges = [
    { source: "case-001", target: "domain-1" },
    { source: "case-001", target: "ip-1" },
    { source: "domain-1", target: "ip-1" },
    { source: "domain-1", target: "domain-2" },
    { source: "domain-2", target: "ip-2" },
    { source: "ip-2", target: "email-1" },
    { source: "email-1", target: "hash-1" },
  ]

  // Sample data for activity heatmap
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 180) // 6 months ago

  const activityData = Array.from({ length: 180 }, (_, i) => {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)

    return {
      date: date.toISOString().split("T")[0],
      count: Math.floor(Math.random() * 10), // Random activity count
    }
  })

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Threat Intelligence</h1>
          <p className="text-muted-foreground mt-1">Monitor and analyze threat patterns and trends</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="180d">Last 180 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Custom Range
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
              High Risk Threats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">23</div>
            <div className="flex items-center text-sm text-green-600 dark:text-green-400">
              <TrendingUp className="mr-1 h-4 w-4" />
              <span>+2 from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Globe className="mr-2 h-5 w-5 text-blue-500" />
              Affected Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">17</div>
            <div className="flex items-center text-sm text-amber-600 dark:text-amber-400">
              <TrendingUp className="mr-1 h-4 w-4" />
              <span>+3 from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-purple-500" />
              Threat Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>No change from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Threat Relationship Graph</CardTitle>
          <CardDescription>Visualize connections between threats, domains, IPs, and other entities</CardDescription>
        </CardHeader>
        <CardContent>
          <NetworkGraph nodes={graphNodes} edges={graphEdges} height={400} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Heatmap</CardTitle>
          <CardDescription>Threat activity over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityHeatmap data={activityData} startDate={startDate} endDate={today} />
        </CardContent>
      </Card>

      <Tabs defaultValue="insights">
        <TabsList>
          <TabsTrigger value="insights">Threat Insights</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="iocs">IOCs</TabsTrigger>
        </TabsList>
        <TabsContent value="insights" className="mt-4">
          <ThreatInsights />
        </TabsContent>
        <TabsContent value="trends" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Trending Threat Vectors</h3>
              <p>Trend analysis content would go here</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="iocs" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Indicators of Compromise</h3>
              <p>IOC list would go here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


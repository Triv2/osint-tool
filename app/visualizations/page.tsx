"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NetworkGraph } from "@/components/network-graph"
import { TimelineChart } from "@/components/timeline-chart"
import { HeatmapCalendar } from "@/components/heatmap-calendar"
import { ThreatMap } from "@/components/threat-map"
import { BarChart3, Calendar, Network, Globe, Filter } from "lucide-react"
import { getCases } from "@/lib/firestore"

export default function VisualizationsPage() {
  const [activeTab, setActiveTab] = useState("network")
  const [timeRange, setTimeRange] = useState("90days")
  const [riskLevel, setRiskLevel] = useState("all")
  const [loading, setLoading] = useState(true)
  const [cases, setCases] = useState<any[]>([])

  // Sample network data
  const [networkData, setNetworkData] = useState<{
    nodes: { id: string; label: string; type: string; size?: number }[]
    edges: { source: string; target: string; label?: string }[]
  }>({
    nodes: [],
    edges: [],
  })

  // Sample timeline data
  const [timelineData, setTimelineData] = useState<{
    events: { id: string; date: Date; title: string; description?: string; type: string }[]
  }>({
    events: [],
  })

  // Sample heatmap data
  const [heatmapData, setHeatmapData] = useState<{
    data: { date: Date; count: number }[]
  }>({
    data: [],
  })

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        // Get cases from Firestore
        const casesData = await getCases({
          riskLevel: riskLevel !== "all" ? riskLevel : undefined,
          orderByField: "createdAt",
          orderDirection: "desc",
        })

        setCases(casesData)

        // Process data for visualizations
        processNetworkData(casesData)
        processTimelineData(casesData)
        processHeatmapData(casesData)
      } catch (error) {
        console.error("Error loading visualization data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [timeRange, riskLevel])

  // Process case data for network visualization
  function processNetworkData(casesData: any[]) {
    const nodes: any[] = []
    const edges: any[] = []
    const nodeMap = new Map()

    // Add case nodes
    casesData.forEach((caseItem) => {
      // Add case node
      const caseNodeId = `case-${caseItem.id}`
      nodes.push({
        id: caseNodeId,
        label: caseItem.title.length > 20 ? caseItem.title.substring(0, 20) + "..." : caseItem.title,
        type: "case",
        size: 12,
      })
      nodeMap.set(caseNodeId, true)

      // Add query node
      const queryNodeId = `${caseItem.queryType}-${caseItem.query}`
      if (!nodeMap.has(queryNodeId)) {
        nodes.push({
          id: queryNodeId,
          label: caseItem.query,
          type: caseItem.queryType,
        })
        nodeMap.set(queryNodeId, true)
      }

      // Add edge between case and query
      edges.push({
        source: caseNodeId,
        target: queryNodeId,
        label: "searches",
      })

      // Add related entities from results if available
      if (caseItem.results) {
        // Process IP addresses
        if (caseItem.results.shodan?.ip) {
          const ipNodeId = `ip-${caseItem.results.shodan.ip}`
          if (!nodeMap.has(ipNodeId)) {
            nodes.push({
              id: ipNodeId,
              label: caseItem.results.shodan.ip,
              type: "ip",
            })
            nodeMap.set(ipNodeId, true)
          }

          edges.push({
            source: queryNodeId,
            target: ipNodeId,
            label: "resolves to",
          })
        }

        // Process related domains
        if (caseItem.results.intelx?.relatedDomains) {
          caseItem.results.intelx.relatedDomains.forEach((domain: string) => {
            const domainNodeId = `domain-${domain}`
            if (!nodeMap.has(domainNodeId)) {
              nodes.push({
                id: domainNodeId,
                label: domain,
                type: "domain",
              })
              nodeMap.set(domainNodeId, true)
            }

            edges.push({
              source: queryNodeId,
              target: domainNodeId,
              label: "related to",
            })
          })
        }
      }
    })

    setNetworkData({ nodes, edges })
  }

  // Process case data for timeline visualization
  function processTimelineData(casesData: any[]) {
    const events: any[] = []

    // Add case events
    casesData.forEach((caseItem) => {
      events.push({
        id: `case-${caseItem.id}`,
        date: new Date(caseItem.date),
        title: caseItem.title,
        description: caseItem.summary,
        type: "case",
      })
    })

    // Add some sample search events
    const searchDates = [
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
    ]

    searchDates.forEach((date, i) => {
      events.push({
        id: `search-${i}`,
        date,
        title: `Search #${i + 1}`,
        type: "search",
      })
    })

    // Add some sample alert events
    const alertDates = [
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    ]

    alertDates.forEach((date, i) => {
      events.push({
        id: `alert-${i}`,
        date,
        title: `Security Alert #${i + 1}`,
        type: "alert",
      })
    })

    setTimelineData({ events })
  }

  // Process case data for heatmap visualization
  function processHeatmapData(casesData: any[]) {
    // Create a map of dates to counts
    const dateCounts = new Map<string, number>()

    // Process case dates
    casesData.forEach((caseItem) => {
      const date = new Date(caseItem.date)
      const dateStr = date.toISOString().split("T")[0]
      dateCounts.set(dateStr, (dateCounts.get(dateStr) || 0) + 1)
    })

    // Fill in missing dates with zero counts
    const endDate = new Date()
    let startDate: Date

    switch (timeRange) {
      case "30days":
        startDate = new Date(endDate)
        startDate.setDate(startDate.getDate() - 30)
        break
      case "90days":
        startDate = new Date(endDate)
        startDate.setDate(startDate.getDate() - 90)
        break
      case "180days":
        startDate = new Date(endDate)
        startDate.setDate(startDate.getDate() - 180)
        break
      case "365days":
        startDate = new Date(endDate)
        startDate.setDate(startDate.getDate() - 365)
        break
      default:
        startDate = new Date(endDate)
        startDate.setDate(startDate.getDate() - 90)
    }

    const data: { date: Date; count: number }[] = []

    // Iterate through each day in the range
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0]
      data.push({
        date: new Date(dateStr),
        count: dateCounts.get(dateStr) || 0,
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    setHeatmapData({ data })
  }

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visualizations</h1>
          <p className="text-muted-foreground mt-1">Visual analysis of your OSINT data</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="180days">Last 180 Days</SelectItem>
              <SelectItem value="365days">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={riskLevel} onValueChange={setRiskLevel}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
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
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="network">
            <Network className="mr-2 h-4 w-4" />
            Network Graph
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Calendar className="mr-2 h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="heatmap">
            <BarChart3 className="mr-2 h-4 w-4" />
            Activity Heatmap
          </TabsTrigger>
          <TabsTrigger value="geomap">
            <Globe className="mr-2 h-4 w-4" />
            Geographic Map
          </TabsTrigger>
        </TabsList>

        <TabsContent value="network" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Entity Relationship Network</CardTitle>
              <CardDescription>Visualize connections between cases, IPs, domains, and other entities</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-[500px]">
                  <p>Loading network data...</p>
                </div>
              ) : networkData.nodes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[500px]">
                  <Network className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Network Data</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    There is no data available to visualize. Try changing your filters or adding more cases.
                  </p>
                </div>
              ) : (
                <NetworkGraph nodes={networkData.nodes} edges={networkData.edges} height={500} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Investigation Timeline</CardTitle>
              <CardDescription>Chronological view of cases, searches, and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <p>Loading timeline data...</p>
                </div>
              ) : timelineData.events.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px]">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Timeline Data</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    There is no data available to visualize. Try changing your filters or adding more cases.
                  </p>
                </div>
              ) : (
                <TimelineChart events={timelineData.events} height={300} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heatmap" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Heatmap</CardTitle>
              <CardDescription>Calendar view of case creation activity</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <p>Loading heatmap data...</p>
                </div>
              ) : heatmapData.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px]">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Heatmap Data</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    There is no data available to visualize. Try changing your filters or adding more cases.
                  </p>
                </div>
              ) : (
                <HeatmapCalendar data={heatmapData.data} height={300} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geomap" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Threat Map</CardTitle>
              <CardDescription>Global distribution of identified threats</CardDescription>
            </CardHeader>
            <CardContent>
              <ThreatMap />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


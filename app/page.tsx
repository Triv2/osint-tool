import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecentCases } from "@/components/recent-cases"
import { StatsOverview } from "@/components/stats-overview"
import { ThreatInsights } from "@/components/threat-insights"
import { ThreatMap } from "@/components/threat-map"
import { ActivityTimeline } from "@/components/activity-timeline"
import { RiskDistribution } from "@/components/risk-distribution"
import Link from "next/link"
import { Search, FileText, AlertTriangle, BarChart3 } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your OSINT intelligence and recent activities</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/cases">
              <FileText className="mr-2 h-4 w-4" />
              View All Cases
            </Link>
          </Button>
          <Button asChild>
            <Link href="/search">
              <Search className="mr-2 h-4 w-4" />
              New Search
            </Link>
          </Button>
        </div>
      </div>

      <StatsOverview />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-primary" />
              Risk Distribution
            </CardTitle>
            <CardDescription>Distribution of cases by risk level</CardDescription>
          </CardHeader>
          <CardContent>
            <RiskDistribution />
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest actions and investigations</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityTimeline />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Threat Geography</CardTitle>
          <CardDescription>Global distribution of identified threats</CardDescription>
        </CardHeader>
        <CardContent>
          <ThreatMap />
        </CardContent>
      </Card>

      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Recent Cases</TabsTrigger>
          <TabsTrigger value="insights">Threat Insights</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="mt-4">
          <RecentCases />
        </TabsContent>
        <TabsContent value="insights" className="mt-4">
          <ThreatInsights />
        </TabsContent>
      </Tabs>
    </div>
  )
}


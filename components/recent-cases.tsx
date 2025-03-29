import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, FileText, Calendar, Hash, Globe, Mail, Server } from "lucide-react"
import Link from "next/link"

const recentCases = [
  {
    id: "case-001",
    title: "Suspicious Domain Investigation",
    query: "malicious-domain.com",
    date: "2023-03-28",
    riskLevel: "high",
    type: "domain",
  },
  {
    id: "case-002",
    title: "IP Address Analysis",
    query: "192.168.1.1",
    date: "2023-03-27",
    riskLevel: "medium",
    type: "ip",
  },
  {
    id: "case-003",
    title: "Email Breach Check",
    query: "user@example.com",
    date: "2023-03-26",
    riskLevel: "low",
    type: "email",
  },
  {
    id: "case-004",
    title: "Malware Hash Analysis",
    query: "a1b2c3d4e5f6...",
    date: "2023-03-25",
    riskLevel: "high",
    type: "hash",
  },
]

export function RecentCases() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {recentCases.map((caseItem) => (
        <Card
          key={caseItem.id}
          className="overflow-hidden border-0 shadow-md transition-all duration-200 hover:shadow-lg"
        >
          <div
            className={`h-1 w-full ${caseItem.riskLevel === "high" ? "bg-red-500" : caseItem.riskLevel === "medium" ? "bg-amber-500" : "bg-green-500"}`}
          ></div>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TypeIcon type={caseItem.type} />
                <CardTitle className="ml-2 text-lg">{caseItem.title}</CardTitle>
              </div>
            </div>
            <CardDescription className="flex items-center">
              <span className="font-mono">{caseItem.query}</span>
              <span className="mx-2">•</span>
              <Calendar className="h-3 w-3 mr-1" />
              {caseItem.date}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <RiskBadge level={caseItem.riskLevel} />
              <Button asChild variant="ghost" size="sm" className="hover:bg-transparent hover:text-primary">
                <Link href={`/cases/${caseItem.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="md:col-span-2 flex justify-center mt-2">
        <Button asChild variant="outline">
          <Link href="/cases">
            <FileText className="mr-2 h-4 w-4" />
            View All Cases
          </Link>
        </Button>
      </div>
    </div>
  )
}

function RiskBadge({ level }: { level: string }) {
  switch (level) {
    case "high":
      return (
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
          <span className="text-sm font-medium text-red-600 dark:text-red-400">High Risk</span>
        </div>
      )
    case "medium":
      return (
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Medium Risk</span>
        </div>
      )
    case "low":
      return (
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
          <span className="text-sm font-medium text-green-600 dark:text-green-400">Low Risk</span>
        </div>
      )
    default:
      return (
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-gray-500 mr-2"></div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Unknown</span>
        </div>
      )
  }
}

function TypeIcon({ type }: { type: string }) {
  switch (type) {
    case "ip":
      return <Server className="h-5 w-5 text-blue-500" />
    case "domain":
      return <Globe className="h-5 w-5 text-green-500" />
    case "email":
      return <Mail className="h-5 w-5 text-red-500" />
    case "hash":
      return <Hash className="h-5 w-5 text-purple-500" />
    default:
      return <FileText className="h-5 w-5 text-gray-500" />
  }
}


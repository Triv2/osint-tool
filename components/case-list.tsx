import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Trash2, Calendar, Hash, Globe, Mail, Server, FileText } from "lucide-react"
import Link from "next/link"
import type { Case } from "@/lib/firestore"

interface CaseListProps {
  cases: Case[]
}

export function CaseList({ cases }: CaseListProps) {
  if (cases.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No Cases Found</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Try adjusting your filters or create a new case</p>
          <Button asChild>
            <Link href="/search">
              <Eye className="mr-2 h-4 w-4" />
              New Search
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {cases.map((caseItem) => (
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
                <TypeIcon type={caseItem.queryType} />
                <CardTitle className="ml-2 text-lg">{caseItem.title}</CardTitle>
              </div>
              <RiskBadge level={caseItem.riskLevel} />
            </div>
            <CardDescription className="flex items-center">
              <span className="font-mono">{caseItem.query}</span>
              <span className="mx-2">•</span>
              <Calendar className="h-3 w-3 mr-1" />
              {caseItem.date}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">{caseItem.summary}</p>
            <div className="flex justify-end space-x-2">
              <Button asChild variant="ghost" size="sm" className="hover:bg-transparent hover:text-primary">
                <Link href={`/cases/${caseItem.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-transparent hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-center space-x-2 pt-4">
        <Button variant="outline" size="sm" disabled>
          Previous
        </Button>
        <Button variant="outline" size="sm">
          Next
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


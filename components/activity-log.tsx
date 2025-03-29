"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Search, AlertTriangle, User, Clock, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"
import { subscribeToActivityLogs, type ActivityLog } from "@/lib/realtime"

interface ActivityLogProps {
  caseId?: string
  limit?: number
  showFilters?: boolean
}

export function ActivityLogComponent({ caseId, limit = 10, showFilters = true }: ActivityLogProps) {
  const { user } = useAuth()
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    if (!user) return

    setLoading(true)

    // Subscribe to activity logs
    const unsubscribe = subscribeToActivityLogs(
      (newLogs) => {
        setLogs(newLogs)
        setLoading(false)
      },
      {
        caseId,
        limit,
      },
    )

    return () => unsubscribe()
  }, [user, caseId, limit])

  // Filter logs based on selected filter
  const filteredLogs = logs.filter((log) => {
    if (filter === "all") return true

    switch (filter) {
      case "case":
        return log.action.includes("case")
      case "search":
        return log.action.includes("search")
      case "alert":
        return log.action.includes("alert")
      case "user":
        return log.action.includes("user") || log.action.includes("login")
      default:
        return true
    }
  })

  const getActionIcon = (action: string) => {
    if (action.includes("case")) {
      return <FileText className="h-4 w-4 text-blue-500" />
    } else if (action.includes("search")) {
      return <Search className="h-4 w-4 text-green-500" />
    } else if (action.includes("alert")) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    } else if (action.includes("user") || action.includes("login")) {
      return <User className="h-4 w-4 text-purple-500" />
    } else {
      return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>Recent activity in the system</CardDescription>
          </div>
          {showFilters && (
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="case">Case Activities</SelectItem>
                <SelectItem value="search">Searches</SelectItem>
                <SelectItem value="alert">Alerts</SelectItem>
                <SelectItem value="user">User Activities</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p>Loading activity logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Activity Logs</h3>
            <p className="text-muted-foreground text-center">There are no activity logs to display.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start space-x-3">
                <div className="mt-0.5">{getActionIcon(log.action)}</div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-medium">{log.userName || log.userEmail || "Unknown User"}</span>
                    <span className="mx-2 text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{log.createdAt.toDate().toLocaleString()}</span>
                  </div>
                  <div className="text-sm">{log.action}</div>
                  {log.details && <div className="text-sm text-muted-foreground mt-1">{log.details}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { FileText, AlertTriangle, Search, Shield, TrendingUp, TrendingDown } from "lucide-react"
import { useState, useEffect } from "react"

export function StatsOverview() {
  // Animation states
  const [counters, setCounters] = useState({
    totalCases: 0,
    highRiskThreats: 0,
    searchesToday: 0,
    protectedAssets: 0,
  })

  useEffect(() => {
    // Animate counters on component mount
    const interval = setInterval(() => {
      setCounters((prev) => ({
        totalCases: prev.totalCases >= 127 ? 127 : prev.totalCases + 3,
        highRiskThreats: prev.highRiskThreats >= 23 ? 23 : prev.highRiskThreats + 1,
        searchesToday: prev.searchesToday >= 42 ? 42 : prev.searchesToday + 2,
        protectedAssets: prev.protectedAssets >= 89 ? 89 : prev.protectedAssets + 3,
      }))
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Cases"
        value={counters.totalCases}
        change="+5 from last week"
        trend="up"
        icon={<FileText className="h-5 w-5 text-blue-500" />}
        color="blue"
      />
      <StatCard
        title="High Risk Threats"
        value={counters.highRiskThreats}
        change="+2 from last week"
        trend="up"
        icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
        color="red"
      />
      <StatCard
        title="Searches Today"
        value={counters.searchesToday}
        change="+12% from yesterday"
        trend="up"
        icon={<Search className="h-5 w-5 text-purple-500" />}
        color="purple"
      />
      <StatCard
        title="Protected Assets"
        value={counters.protectedAssets}
        change="+3 from last week"
        trend="up"
        icon={<Shield className="h-5 w-5 text-green-500" />}
        color="green"
      />
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  change: string
  trend: "up" | "down" | "neutral"
  icon: React.ReactNode
  color: "blue" | "red" | "purple" | "green"
}

function StatCard({ title, value, change, trend, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: "from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30",
    red: "from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30",
    purple: "from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30",
    green: "from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30",
  }

  const iconColorClasses = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
    red: "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400",
    green: "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400",
  }

  return (
    <Card className={`overflow-hidden bg-gradient-to-br ${colorClasses[color]} border-0 shadow-md`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
            <span className="text-3xl font-bold mt-1">{value.toLocaleString()}</span>
            <div className="flex items-center mt-1 text-xs">
              {trend === "up" ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : trend === "down" ? (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              ) : null}
              <span
                className={
                  trend === "up"
                    ? "text-green-600 dark:text-green-400"
                    : trend === "down"
                      ? "text-red-600 dark:text-red-400"
                      : "text-muted-foreground"
                }
              >
                {change}
              </span>
            </div>
          </div>
          <div className={`rounded-full p-3 ${iconColorClasses[color]}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}


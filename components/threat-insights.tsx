import type React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, TrendingUp, Globe, Server } from "lucide-react"

export function ThreatInsights() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <InsightCard
        title="Emerging Threat Alert"
        description="New ransomware variant detected in the wild"
        content="A new ransomware variant named 'CryptoLock' has been observed targeting financial institutions. Initial access is gained through phishing emails with malicious Excel attachments."
        icon={<AlertTriangle className="h-5 w-5 text-white" />}
        severity="critical"
        iconBg="bg-red-500"
      />

      <InsightCard
        title="Trending Threat Vector"
        description="Increase in API-based attacks"
        content="There has been a 43% increase in attacks targeting API endpoints over the past month. Most attacks focus on authentication bypass and data exfiltration."
        icon={<TrendingUp className="h-5 w-5 text-white" />}
        severity="medium"
        iconBg="bg-amber-500"
      />

      <InsightCard
        title="Geographic Insight"
        description="Attack origin distribution"
        content="Recent attack traffic shows a shift in origin countries, with a significant increase from Eastern European IP ranges and a decrease from previously common sources."
        icon={<Globe className="h-5 w-5 text-white" />}
        severity="info"
        iconBg="bg-blue-500"
      />

      <InsightCard
        title="Infrastructure Update"
        description="New C2 infrastructure identified"
        content="New command and control servers have been identified for the APT group 'Phantom Spider'. Updated IOCs have been added to the threat intelligence database."
        icon={<Server className="h-5 w-5 text-white" />}
        severity="low"
        iconBg="bg-green-500"
      />
    </div>
  )
}

interface InsightCardProps {
  title: string
  description: string
  content: string
  icon: React.ReactNode
  severity: "critical" | "high" | "medium" | "low" | "info"
  iconBg: string
}

function InsightCard({ title, description, content, icon, severity, iconBg }: InsightCardProps) {
  const severityMap = {
    critical: <Badge variant="destructive">Critical</Badge>,
    high: <Badge variant="destructive">High</Badge>,
    medium: (
      <Badge variant="default" className="bg-amber-500">
        Medium
      </Badge>
    ),
    low: (
      <Badge variant="outline" className="text-green-500 border-green-500">
        Low
      </Badge>
    ),
    info: <Badge variant="secondary">Informational</Badge>,
  }

  return (
    <Card className="overflow-hidden border-0 shadow-md transition-all duration-200 hover:shadow-lg">
      <div className="flex items-start p-4">
        <div className={`rounded-full p-3 mr-4 ${iconBg}`}>{icon}</div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium">{title}</h3>
            {severityMap[severity]}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{description}</p>
          <p className="text-sm">{content}</p>
        </div>
      </div>
    </Card>
  )
}


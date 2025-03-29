import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Copy, Eye, RefreshCw } from "lucide-react"

export default function ApiKeysPage() {
  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>OSINT API Integrations</CardTitle>
          <CardDescription>Manage your API keys for OSINT data sources</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ApiKeyInput name="Shodan" description="Exposed devices & services" status="active" />

          <Separator />

          <ApiKeyInput name="VirusTotal" description="Malware & file reputation" status="active" />

          <Separator />

          <ApiKeyInput name="Have I Been Pwned" description="Breached emails & credentials" status="active" />

          <Separator />

          <ApiKeyInput name="Censys" description="Internet asset discovery" status="active" />

          <Separator />

          <ApiKeyInput name="GreyNoise" description="IP reputation & noise filtering" status="inactive" />

          <Separator />

          <ApiKeyInput name="Intelligence X" description="Historical & leaked data" status="active" />

          <Separator />

          <ApiKeyInput name="OpenAI" description="AI-powered analysis" status="active" />
        </CardContent>
      </Card>
    </div>
  )
}

interface ApiKeyInputProps {
  name: string
  description: string
  status: "active" | "inactive" | "expired"
}

function ApiKeyInput({ name, description, status }: ApiKeyInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{name}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="flex space-x-2">
        <div className="flex-1">
          <Label htmlFor={`${name.toLowerCase()}-api`} className="sr-only">
            {name} API Key
          </Label>
          <Input id={`${name.toLowerCase()}-api`} type="password" value="••••••••••••••••••••••••••••••" readOnly />
        </div>
        <Button variant="outline" size="icon" title="Show API Key">
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" title="Copy API Key">
          <Copy className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" title="Regenerate API Key">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: "active" | "inactive" | "expired" }) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-500">Active</Badge>
    case "inactive":
      return <Badge variant="outline">Inactive</Badge>
    case "expired":
      return <Badge variant="destructive">Expired</Badge>
  }
}


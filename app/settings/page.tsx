import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage() {
  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api">API Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure general application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select defaultValue="system">
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-save">Auto-save searches as cases</Label>
                  <Switch id="auto-save" defaultChecked />
                </div>
                <p className="text-sm text-muted-foreground">Automatically save all search results as cases</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ai-analysis">Enable AI analysis</Label>
                  <Switch id="ai-analysis" defaultChecked />
                </div>
                <p className="text-sm text-muted-foreground">
                  Use AI to analyze OSINT data and provide risk assessments
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="similar-cases">Show similar cases</Label>
                  <Switch id="similar-cases" defaultChecked />
                </div>
                <p className="text-sm text-muted-foreground">
                  Use AI to find and display similar cases based on query context
                </p>
              </div>

              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>API Integrations</CardTitle>
              <CardDescription>Configure OSINT API integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shodan-api">Shodan API Key</Label>
                <Input id="shodan-api" type="password" value="••••••••••••••••" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="virustotal-api">VirusTotal API Key</Label>
                <Input id="virustotal-api" type="password" value="••••••••••••••••" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hibp-api">Have I Been Pwned API Key</Label>
                <Input id="hibp-api" type="password" value="••••••••••••••••" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="censys-api">Censys API Key</Label>
                <Input id="censys-api" type="password" value="••••••••••••••••" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="greynoise-api">GreyNoise API Key</Label>
                <Input id="greynoise-api" type="password" value="••••••••••••••••" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="intelx-api">Intelligence X API Key</Label>
                <Input id="intelx-api" type="password" value="••••••••••••••••" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="openai-api">OpenAI API Key</Label>
                <Input id="openai-api" type="password" value="••••••••••••••••" />
              </div>

              <Button>Save API Keys</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-address">Email Address</Label>
                <Input id="email-address" type="email" placeholder="your@email.com" />
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="high-risk-alerts">High Risk Alerts</Label>
                  <Switch id="high-risk-alerts" defaultChecked />
                </div>
                <p className="text-sm text-muted-foreground">Receive alerts for high risk findings</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="medium-risk-alerts">Medium Risk Alerts</Label>
                  <Switch id="medium-risk-alerts" defaultChecked />
                </div>
                <p className="text-sm text-muted-foreground">Receive alerts for medium risk findings</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="low-risk-alerts">Low Risk Alerts</Label>
                  <Switch id="low-risk-alerts" />
                </div>
                <p className="text-sm text-muted-foreground">Receive alerts for low risk findings</p>
              </div>

              <Button>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue="John Doe" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john.doe@example.com" />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>

              <Button>Update Account</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AlertTriangle, Server, Globe, Mail, FileText, Shield } from "lucide-react"

interface SearchResultsProps {
  source?: string
}

export function SearchResults({ source }: SearchResultsProps) {
  // This would normally come from an API call
  const aiAnalysis = {
    riskLevel: "medium",
    summary:
      "The analyzed domain shows moderate risk indicators with some suspicious activities detected. While not definitively malicious, there are several concerning signals that warrant further investigation.",
    keyFindings: [
      "Domain was registered in the last 30 days",
      "SSL certificate issued by a free provider",
      "Hosted on infrastructure previously associated with phishing campaigns",
      "No breached credentials found for this domain",
      "Low reputation score on VirusTotal (2/80 engines)",
    ],
  }

  return (
    <div className="space-y-6 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-primary" />
            AI Risk Assessment
          </CardTitle>
          <CardDescription>Analysis based on aggregated OSINT data</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert
            className={`mb-4 ${aiAnalysis.riskLevel === "high" ? "border-destructive" : aiAnalysis.riskLevel === "medium" ? "border-amber-500" : "border-green-500"}`}
          >
            <AlertTriangle
              className={`h-4 w-4 ${aiAnalysis.riskLevel === "high" ? "text-destructive" : aiAnalysis.riskLevel === "medium" ? "text-amber-500" : "text-green-500"}`}
            />
            <AlertTitle className="capitalize">{aiAnalysis.riskLevel} Risk Level</AlertTitle>
            <AlertDescription>{aiAnalysis.summary}</AlertDescription>
          </Alert>

          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Key Findings:</h4>
            <ul className="space-y-1">
              {aiAnalysis.keyFindings.map((finding, index) => (
                <li key={index} className="text-sm flex items-start">
                  <span className="mr-2">•</span>
                  {finding}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Accordion type="multiple" defaultValue={["shodan", "virustotal", "hibp"]}>
        <AccordionItem value="shodan">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center">
              <Server className="mr-2 h-5 w-5 text-blue-500" />
              <span>Shodan Results</span>
              <Badge variant="outline" className="ml-2">
                IP Data
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Open Ports</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Badge variant="outline" className="justify-center">
                        22/SSH
                      </Badge>
                      <Badge variant="outline" className="justify-center">
                        80/HTTP
                      </Badge>
                      <Badge variant="outline" className="justify-center">
                        443/HTTPS
                      </Badge>
                      <Badge variant="outline" className="justify-center">
                        3306/MySQL
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">Location</h4>
                    <p className="text-sm">Amsterdam, Netherlands</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">ISP</h4>
                    <p className="text-sm">Digital Ocean, Inc.</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">Last Seen</h4>
                    <p className="text-sm">2023-03-25</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="virustotal">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center">
              <Globe className="mr-2 h-5 w-5 text-green-500" />
              <span>VirusTotal Results</span>
              <Badge variant="outline" className="ml-2">
                Reputation
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Detection Ratio</h4>
                    <p className="text-sm">2/80 security vendors flagged as malicious</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Business</Badge>
                      <Badge variant="outline">Technology</Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">First Seen</h4>
                    <p className="text-sm">2023-03-01</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">Last Analysis</h4>
                    <p className="text-sm">2023-03-27</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="hibp">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center">
              <Mail className="mr-2 h-5 w-5 text-red-500" />
              <span>Have I Been Pwned Results</span>
              <Badge variant="outline" className="ml-2">
                Breaches
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Breach Status</h4>
                    <p className="text-sm">No breaches found for this domain</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">Paste Status</h4>
                    <p className="text-sm">No pastes found for this domain</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">Last Checked</h4>
                    <p className="text-sm">2023-03-28</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="censys">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center">
              <Globe className="mr-2 h-5 w-5 text-purple-500" />
              <span>Censys Results</span>
              <Badge variant="outline" className="ml-2">
                Infrastructure
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Certificates</h4>
                    <p className="text-sm">1 valid SSL certificate found</p>
                    <p className="text-xs text-muted-foreground">Issued by: Let's Encrypt Authority X3</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">Services</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Badge variant="outline" className="justify-center">
                        HTTP
                      </Badge>
                      <Badge variant="outline" className="justify-center">
                        HTTPS
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">Autonomous System</h4>
                    <p className="text-sm">AS14061 (DIGITALOCEAN-ASN)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="greynoise">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center">
              <Shield className="mr-2 h-5 w-5 text-gray-500" />
              <span>GreyNoise Results</span>
              <Badge variant="outline" className="ml-2">
                IP Reputation
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Classification</h4>
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                      Benign
                    </Badge>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">Activity</h4>
                    <p className="text-sm">No malicious activity observed</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">First Seen</h4>
                    <p className="text-sm">2023-02-15</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">Last Seen</h4>
                    <p className="text-sm">2023-03-26</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="intelx">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-amber-500" />
              <span>Intelligence X Results</span>
              <Badge variant="outline" className="ml-2">
                Leaks & Archives
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Leaks</h4>
                    <p className="text-sm">No sensitive data leaks found</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">Historical Data</h4>
                    <p className="text-sm">Domain first registered: 2023-03-01</p>
                    <p className="text-sm">Previous owners: None found</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">Related Domains</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">example-similar.com</Badge>
                      <Badge variant="outline">example-clone.net</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}


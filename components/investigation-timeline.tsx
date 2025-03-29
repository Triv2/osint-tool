"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Calendar, Search, FileText, AlertTriangle, Shield } from "lucide-react"

interface TimelineEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  type: "search" | "case" | "alert" | "protection"
  relatedId?: string
}

interface InvestigationTimelineProps {
  events: TimelineEvent[]
}

export function InvestigationTimeline({ events }: InvestigationTimelineProps) {
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({})

  const toggleEvent = (eventId: string) => {
    setExpandedEvents((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }))
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "search":
        return <Search className="h-5 w-5 text-blue-500" />
      case "case":
        return <FileText className="h-5 w-5 text-green-500" />
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "protection":
        return <Shield className="h-5 w-5 text-purple-500" />
      default:
        return <Calendar className="h-5 w-5 text-gray-500" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case "search":
        return "border-blue-200 dark:border-blue-900"
      case "case":
        return "border-green-200 dark:border-green-900"
      case "alert":
        return "border-red-200 dark:border-red-900"
      case "protection":
        return "border-purple-200 dark:border-purple-900"
      default:
        return "border-gray-200 dark:border-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <Card
          key={event.id}
          className={`border-l-4 ${getEventColor(event.type)} transition-all duration-200 hover:shadow-md`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="mt-1">{getEventIcon(event.type)}</div>
                <div>
                  <h3 className="font-medium">{event.title}</h3>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>
                      {event.date} at {event.time}
                    </span>
                  </div>

                  {expandedEvents[event.id] && <p className="text-sm mt-2">{event.description}</p>}
                </div>
              </div>

              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toggleEvent(event.id)}>
                {expandedEvents[event.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


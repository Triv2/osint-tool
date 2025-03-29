import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, FileText, AlertTriangle, Shield, User } from "lucide-react"

const activities = [
  {
    id: 1,
    user: {
      name: "John Doe",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    action: "created a new case",
    target: "Suspicious Domain Investigation",
    time: "10 minutes ago",
    icon: FileText,
    iconColor: "text-blue-500",
  },
  {
    id: 2,
    user: {
      name: "Alice Smith",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    action: "performed OSINT search",
    target: "192.168.1.1",
    time: "25 minutes ago",
    icon: Search,
    iconColor: "text-purple-500",
  },
  {
    id: 3,
    user: {
      name: "Bob Johnson",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    action: "identified high risk threat",
    target: "Malware Hash Analysis",
    time: "1 hour ago",
    icon: AlertTriangle,
    iconColor: "text-red-500",
  },
  {
    id: 4,
    user: {
      name: "Emma Wilson",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    action: "added protection for",
    target: "corporate-domain.com",
    time: "2 hours ago",
    icon: Shield,
    iconColor: "text-green-500",
  },
]

export function ActivityTimeline() {
  return (
    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={activity.avatar} alt={activity.user.name} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1">
            <div className="flex items-center">
              <p className="text-sm font-medium">{activity.user.name}</p>
              <span className="mx-2 text-muted-foreground">•</span>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
            <div className="flex items-center">
              <p className="text-sm">
                {activity.action} <span className="font-medium">{activity.target}</span>
              </p>
            </div>
          </div>

          <div className={`rounded-full p-2 bg-muted ${activity.iconColor}`}>
            <activity.icon className="h-4 w-4" />
          </div>
        </div>
      ))}
    </div>
  )
}


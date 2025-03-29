"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-provider"
import type { RolePermissions } from "@/lib/auth-types"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: keyof RolePermissions
}

export function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const { user, loading, checkPermission } = useAuth()
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else if (requiredPermission) {
        checkPermission(requiredPermission).then((result) => {
          setHasPermission(result)
          if (!result) {
            router.push("/unauthorized")
          }
        })
      } else {
        setHasPermission(true)
      }
    }
  }, [user, loading, requiredPermission, router, checkPermission])

  if (loading || (requiredPermission && hasPermission === null)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || (requiredPermission && !hasPermission)) {
    return null
  }

  return <>{children}</>
}


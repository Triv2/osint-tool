"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, UserPlus, MoreHorizontal, Trash, Edit, Shield, LogOut, Eye } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { getUserTeams, createTeam, addTeamMember, removeTeamMember, updateTeamMemberRole } from "@/lib/auth"
import type { Team, UserRole } from "@/lib/auth-types"

export default function TeamsPage() {
  const { user, userProfile, hasPermission } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamDescription, setNewTeamDescription] = useState("")
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [newMemberRole, setNewMemberRole] = useState<UserRole>("analyst")
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function loadTeams() {
      if (!user) return

      try {
        const userTeams = await getUserTeams(user.uid)
        setTeams(userTeams)
      } catch (error) {
        console.error("Error loading teams:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTeams()
  }, [user])

  const handleCreateTeam = async () => {
    if (!user || !newTeamName.trim()) return

    try {
      const team = await createTeam(newTeamName, user.uid, newTeamDescription)
      setTeams([...teams, team])
      setNewTeamName("")
      setNewTeamDescription("")
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error("Error creating team:", error)
    }
  }

  const handleAddMember = async () => {
    if (!selectedTeam || !newMemberEmail.trim()) return

    try {
      await addTeamMember(selectedTeam.id, newMemberEmail, newMemberRole)

      // Refresh teams
      const userTeams = await getUserTeams(user!.uid)
      setTeams(userTeams)

      setNewMemberEmail("")
      setNewMemberRole("analyst")
      setIsAddMemberDialogOpen(false)
    } catch (error) {
      console.error("Error adding team member:", error)
    }
  }

  const handleRemoveMember = async (teamId: string, userId: string) => {
    try {
      await removeTeamMember(teamId, userId)

      // Refresh teams
      const userTeams = await getUserTeams(user!.uid)
      setTeams(userTeams)
    } catch (error) {
      console.error("Error removing team member:", error)
    }
  }

  const handleUpdateMemberRole = async (teamId: string, userId: string, role: UserRole) => {
    try {
      await updateTeamMemberRole(teamId, userId, role)

      // Refresh teams
      const userTeams = await getUserTeams(user!.uid)
      setTeams(userTeams)
    } catch (error) {
      console.error("Error updating team member role:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <p>Loading teams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground mt-1">Manage your teams and team members</p>
        </div>
        {hasPermission("create:team") && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Users className="mr-2 h-4 w-4" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>Create a new team to collaborate on OSINT investigations</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="team-name">Team Name</Label>
                  <Input
                    id="team-name"
                    placeholder="Enter team name"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team-description">Description (Optional)</Label>
                  <Input
                    id="team-description"
                    placeholder="Enter team description"
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTeam} disabled={!newTeamName.trim()}>
                  Create Team
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Teams Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              You are not a member of any teams yet. Create a team to collaborate with others.
            </p>
            {hasPermission("create:team") && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>Create Your First Team</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {teams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{team.name}</CardTitle>
                  {team.ownerId === user?.uid && (
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      Owner
                    </Badge>
                  )}
                </div>
                <CardDescription>{team.description || "No description"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Team Members</h3>
                    {(team.ownerId === user?.uid || hasPermission("update:team")) && (
                      <Dialog
                        open={isAddMemberDialogOpen && selectedTeam?.id === team.id}
                        onOpenChange={(open) => {
                          setIsAddMemberDialogOpen(open)
                          if (open) setSelectedTeam(team)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Member
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Team Member</DialogTitle>
                            <DialogDescription>Add a new member to the team {team.name}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="member-email">Email Address</Label>
                              <Input
                                id="member-email"
                                placeholder="Enter email address"
                                value={newMemberEmail}
                                onChange={(e) => setNewMemberEmail(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="member-role">Role</Label>
                              <Select
                                value={newMemberRole}
                                onValueChange={(value) => setNewMemberRole(value as UserRole)}
                              >
                                <SelectTrigger id="member-role">
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="analyst">Analyst</SelectItem>
                                  <SelectItem value="viewer">Viewer</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleAddMember} disabled={!newMemberEmail.trim()}>
                              Add Member
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>

                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {team.members.map((member) => (
                          <TableRow key={member.userId}>
                            <TableCell>
                              <div className="font-medium">{member.displayName || "Unnamed User"}</div>
                              <div className="text-sm text-muted-foreground">{member.email}</div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  member.role === "admin"
                                    ? "default"
                                    : member.role === "analyst"
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(member.joinedAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {(team.ownerId === user?.uid || hasPermission("update:team")) && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Actions</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    {member.userId !== team.ownerId && (
                                      <>
                                        <DropdownMenuItem
                                          onClick={() => handleUpdateMemberRole(team.id, member.userId, "admin")}
                                        >
                                          <Shield className="mr-2 h-4 w-4" />
                                          Make Admin
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleUpdateMemberRole(team.id, member.userId, "analyst")}
                                        >
                                          <Edit className="mr-2 h-4 w-4" />
                                          Make Analyst
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleUpdateMemberRole(team.id, member.userId, "viewer")}
                                        >
                                          <Eye className="mr-2 h-4 w-4" />
                                          Make Viewer
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="text-destructive focus:text-destructive"
                                          onClick={() => handleRemoveMember(team.id, member.userId)}
                                        >
                                          <Trash className="mr-2 h-4 w-4" />
                                          Remove Member
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    {member.userId === user?.uid && member.userId !== team.ownerId && (
                                      <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => handleRemoveMember(team.id, member.userId)}
                                      >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Leave Team
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


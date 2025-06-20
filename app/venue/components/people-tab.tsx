import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Mail, UserPlus, X, MoreVertical } from "lucide-react"
import { toast } from "sonner"
import { TeamMember, TeamInvite, TeamRole, TEAM_ROLES } from '../types/team'
import { inviteTeamMember, updateTeamMemberRole, removeTeamMember } from '../actions/team-actions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface PeopleTabProps {
  eventId: string
  members: TeamMember[]
  invites: TeamInvite[]
  currentUserRole: TeamRole
}

export function PeopleTab({ eventId, members, invites, currentUserRole }: PeopleTabProps) {
  const [isInviting, setIsInviting] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<TeamRole>('staff')
  const [isLoading, setIsLoading] = useState(false)

  const canManageTeam = ['owner', 'admin'].includes(currentUserRole)

  async function handleInvite() {
    if (!inviteEmail || !inviteRole) return
    setIsLoading(true)
    try {
      const result = await inviteTeamMember({
        email: inviteEmail,
        role: inviteRole,
        eventId
      })
      if (result.success) {
        toast.success('Invitation sent successfully')
        setInviteEmail('')
        setInviteRole('staff')
        setIsInviting(false)
      } else {
        toast.error(result.error || 'Failed to send invitation')
      }
    } catch (error) {
      toast.error('Failed to send invitation')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUpdateRole(memberId: string, newRole: TeamRole) {
    try {
      const result = await updateTeamMemberRole(memberId, newRole)
      if (result.success) {
        toast.success('Role updated successfully')
      } else {
        toast.error(result.error || 'Failed to update role')
      }
    } catch (error) {
      toast.error('Failed to update role')
    }
  }

  async function handleRemoveMember(memberId: string) {
    try {
      const result = await removeTeamMember(memberId)
      if (result.success) {
        toast.success('Team member removed successfully')
      } else {
        toast.error(result.error || 'Failed to remove team member')
      }
    } catch (error) {
      toast.error('Failed to remove team member')
    }
  }

  return (
    <div className="space-y-6">
      {/* Invite Section */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-purple-400" /> Invite Team Members
            </span>
            {!isInviting && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsInviting(true)}
                disabled={!canManageTeam}
              >
                <UserPlus className="h-4 w-4 mr-2" /> New Invite
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isInviting ? (
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1"
                />
                <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as TeamRole)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TEAM_ROLES).map(([role, { label }]) => (
                      <SelectItem key={role} value={role}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsInviting(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleInvite} 
                  disabled={isLoading || !inviteEmail}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  Send Invite
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-400">
              {canManageTeam 
                ? "Invite team members by email and assign their roles."
                : "Only owners and admins can invite team members."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Members List */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={member.user.avatar} />
                    <AvatarFallback>
                      {member.user.fullName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-white">{member.user.fullName}</div>
                    <div className="text-sm text-gray-400">{member.user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                    {TEAM_ROLES[member.role].label}
                  </Badge>
                  {canManageTeam && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {Object.entries(TEAM_ROLES).map(([role, { label }]) => (
                          <DropdownMenuItem
                            key={role}
                            onClick={() => handleUpdateRole(member.id, role as TeamRole)}
                            disabled={role === member.role}
                          >
                            Change to {label}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          Remove from team
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {invites.length > 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Pending Invites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-white">{invite.email}</div>
                      <div className="text-sm text-gray-400">
                        Invited as {TEAM_ROLES[invite.role].label}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {invite.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 
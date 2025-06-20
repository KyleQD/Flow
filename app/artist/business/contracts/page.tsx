"use client"

import { useState, useEffect } from "react"
import { useArtist } from "@/contexts/artist-context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { format, addDays, isAfter, isBefore } from "date-fns"
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  User,
  Building,
  ArrowLeft,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Send
} from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import Link from "next/link"

interface Contract {
  id?: string
  title: string
  type: 'performance' | 'licensing' | 'recording' | 'management' | 'publishing' | 'endorsement' | 'other'
  client_name: string
  client_email?: string
  client_company?: string
  amount: number
  currency: string
  start_date: string
  end_date?: string
  status: 'draft' | 'sent' | 'signed' | 'expired' | 'cancelled'
  terms?: string
  notes?: string
  document_url?: string
  created_at?: string
  updated_at?: string
}

const CONTRACT_TYPES = [
  { value: 'performance', label: 'Performance Agreement', description: 'Live show contracts' },
  { value: 'licensing', label: 'Licensing Deal', description: 'Music licensing agreements' },
  { value: 'recording', label: 'Recording Contract', description: 'Studio and recording agreements' },
  { value: 'management', label: 'Management Agreement', description: 'Artist management contracts' },
  { value: 'publishing', label: 'Publishing Deal', description: 'Music publishing agreements' },
  { value: 'endorsement', label: 'Endorsement Deal', description: 'Brand partnerships and sponsorships' },
  { value: 'other', label: 'Other', description: 'Custom contract types' }
]

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD']

export default function ContractsPage() {
  const { user } = useArtist()
  const supabase = createClientComponentClient()
  
  const [contracts, setContracts] = useState<Contract[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingContract, setEditingContract] = useState<Contract | null>(null)
  const [deleteContractId, setDeleteContractId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  
  const [formData, setFormData] = useState<Contract>({
    title: '',
    type: 'performance',
    client_name: '',
    client_email: '',
    client_company: '',
    amount: 0,
    currency: 'USD',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    status: 'draft',
    terms: '',
    notes: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      loadContracts()
    }
  }, [user])

  useEffect(() => {
    if (editingContract) {
      setFormData(editingContract)
    } else {
      setFormData({
        title: '',
        type: 'performance',
        client_name: '',
        client_email: '',
        client_company: '',
        amount: 0,
        currency: 'USD',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        status: 'draft',
        terms: '',
        notes: ''
      })
    }
  }, [editingContract])

  const loadContracts = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      
      // For now, create mock contracts. In a real app, this would be:
      // const { data, error } = await supabase.from('artist_contracts').select('*').eq('user_id', user.id)
      
      const mockContracts: Contract[] = [
        {
          id: '1',
          title: 'Summer Festival Performance',
          type: 'performance',
          client_name: 'Music Festival Inc.',
          client_email: 'booking@musicfest.com',
          client_company: 'Music Festival Inc.',
          amount: 5000,
          currency: 'USD',
          start_date: '2024-07-15',
          end_date: '2024-07-15',
          status: 'signed',
          terms: 'Single night performance, 60-minute set, sound check at 5 PM.',
          notes: 'Travel and accommodation provided by venue.',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-20T15:30:00Z'
        },
        {
          id: '2',
          title: 'TV Commercial License',
          type: 'licensing',
          client_name: 'Brand Agency',
          client_email: 'licensing@brandagency.com',
          client_company: 'Creative Brand Agency',
          amount: 2500,
          currency: 'USD',
          start_date: '2024-02-01',
          end_date: '2024-12-31',
          status: 'sent',
          terms: 'License for use of "Song Title" in national TV commercial campaign.',
          notes: 'Waiting for client signature.',
          created_at: '2024-01-20T14:00:00Z',
          updated_at: '2024-01-25T09:15:00Z'
        },
        {
          id: '3',
          title: 'Recording Studio Agreement',
          type: 'recording',
          client_name: 'Sound Studios',
          client_email: 'booking@soundstudios.com',
          amount: 1200,
          currency: 'USD',
          start_date: '2024-03-01',
          end_date: '2024-03-05',
          status: 'draft',
          terms: '5-day studio rental including engineer and basic mixing.',
          notes: 'Need to finalize dates with studio.',
          created_at: '2024-01-25T11:00:00Z',
          updated_at: '2024-01-25T11:00:00Z'
        }
      ]
      
      setContracts(mockContracts)
    } catch (error) {
      console.error('Error loading contracts:', error)
      toast.error('Failed to load contracts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveContract = async () => {
    if (!user || !formData.title.trim() || !formData.client_name.trim()) {
      toast.error('Please fill in required fields')
      return
    }

    try {
      setIsSubmitting(true)
      
      const contractData = {
        ...formData,
        user_id: user.id,
        updated_at: new Date().toISOString()
      }

      if (editingContract?.id) {
        // Update existing contract
        setContracts(prev => prev.map(contract => 
          contract.id === editingContract.id ? { ...contract, ...contractData } : contract
        ))
        toast.success('Contract updated successfully!')
      } else {
        // Create new contract
        const newContract = {
          ...contractData,
          id: Date.now().toString(),
          created_at: new Date().toISOString()
        }
        
        setContracts(prev => [newContract, ...prev])
        toast.success('Contract created successfully!')
      }
      
      setShowCreateModal(false)
      setEditingContract(null)
    } catch (error) {
      console.error('Error saving contract:', error)
      toast.error('Failed to save contract')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteContract = async (contractId: string) => {
    try {
      setContracts(prev => prev.filter(contract => contract.id !== contractId))
      toast.success('Contract deleted successfully')
    } catch (error) {
      console.error('Error deleting contract:', error)
      toast.error('Failed to delete contract')
    } finally {
      setDeleteContractId(null)
    }
  }

  const handleStatusChange = async (contractId: string, newStatus: Contract['status']) => {
    try {
      setContracts(prev => prev.map(contract => 
        contract.id === contractId ? { ...contract, status: newStatus, updated_at: new Date().toISOString() } : contract
      ))
      
      toast.success(`Contract marked as ${newStatus}`)
    } catch (error) {
      console.error('Error updating contract status:', error)
      toast.error('Failed to update contract status')
    }
  }

  const getStatusColor = (status: Contract['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-600/20 text-gray-300 border-gray-500/30'
      case 'sent': return 'bg-blue-600/20 text-blue-300 border-blue-500/30'
      case 'signed': return 'bg-green-600/20 text-green-300 border-green-500/30'
      case 'expired': return 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30'
      case 'cancelled': return 'bg-red-600/20 text-red-300 border-red-500/30'
      default: return 'bg-gray-600/20 text-gray-300 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: Contract['status']) => {
    switch (status) {
      case 'draft': return <Edit className="h-4 w-4" />
      case 'sent': return <Send className="h-4 w-4" />
      case 'signed': return <CheckCircle className="h-4 w-4" />
      case 'expired': return <AlertCircle className="h-4 w-4" />
      case 'cancelled': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contract.client_company && contract.client_company.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter
    const matchesType = typeFilter === 'all' || contract.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getContractStats = () => {
    const now = new Date()
    return {
      total: contracts.length,
      active: contracts.filter(c => c.status === 'signed').length,
      pending: contracts.filter(c => c.status === 'sent').length,
      totalValue: contracts
        .filter(c => c.status === 'signed')
        .reduce((sum, c) => sum + c.amount, 0),
      expiringSoon: contracts.filter(c => 
        c.end_date && 
        c.status === 'signed' && 
        isAfter(new Date(c.end_date), now) && 
        isBefore(new Date(c.end_date), addDays(now, 30))
      ).length
    }
  }

  const stats = getContractStats()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-700 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/artist/business">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Business
            </Button>
          </Link>
          <div className="h-8 w-px bg-slate-700"></div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Contracts & Legal</h1>
              <p className="text-gray-400">Manage agreements and legal documents</p>
            </div>
          </div>
        </div>
        <Button 
          onClick={() => {
            setEditingContract(null)
            setShowCreateModal(true)
          }}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Contract
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Contracts</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active</p>
                <p className="text-2xl font-bold text-white">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-white">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Value</p>
                <p className="text-2xl font-bold text-white">${stats.totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Expiring Soon</p>
                <p className="text-2xl font-bold text-white">{stats.expiringSoon}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search contracts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="signed">Signed</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {CONTRACT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contracts List */}
      {filteredContracts.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {contracts.length === 0 ? 'No contracts yet' : 'No contracts match your filters'}
            </h3>
            <p className="text-gray-400 mb-6">
              {contracts.length === 0 
                ? 'Create your first contract to get started with legal document management.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {contracts.length === 0 && (
              <Button 
                onClick={() => {
                  setEditingContract(null)
                  setShowCreateModal(true)
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Contract
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredContracts.map((contract) => (
            <Card key={contract.id} className="bg-slate-900/50 border-slate-700/50 group hover:border-purple-500/50 transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {contract.title}
                      </h3>
                      <Badge variant="secondary" className={getStatusColor(contract.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(contract.status)}
                          {contract.status}
                        </div>
                      </Badge>
                      <Badge variant="outline" className="bg-blue-600/20 text-blue-300 border-blue-500/30">
                        {CONTRACT_TYPES.find(t => t.value === contract.type)?.label}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <User className="h-4 w-4 text-blue-400" />
                        <div>
                          <span className="font-medium">{contract.client_name}</span>
                          {contract.client_company && (
                            <div className="text-gray-400">{contract.client_company}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-300">
                        <DollarSign className="h-4 w-4 text-green-400" />
                        <span className="font-medium">
                          {contract.currency} ${contract.amount.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="h-4 w-4 text-purple-400" />
                        <div>
                          <span>{format(new Date(contract.start_date), 'MMM d, yyyy')}</span>
                          {contract.end_date && (
                            <div className="text-gray-400">
                              to {format(new Date(contract.end_date), 'MMM d, yyyy')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {contract.terms && (
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{contract.terms}</p>
                    )}

                    {contract.notes && (
                      <div className="text-xs text-gray-500 bg-slate-800/50 p-2 rounded">
                        <strong>Notes:</strong> {contract.notes}
                      </div>
                    )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                      <DropdownMenuItem 
                        onClick={() => {
                          setEditingContract(contract)
                          setShowCreateModal(true)
                        }}
                        className="text-gray-300 hover:text-white"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Contract
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem className="text-gray-300 hover:text-white">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem className="text-gray-300 hover:text-white">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </DropdownMenuItem>

                      {contract.status === 'draft' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(contract.id!, 'sent')}
                          className="text-gray-300 hover:text-white"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send to Client
                        </DropdownMenuItem>
                      )}

                      {contract.status === 'sent' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(contract.id!, 'signed')}
                          className="text-gray-300 hover:text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Signed
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem 
                        onClick={() => setDeleteContractId(contract.id!)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Contract Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingContract ? 'Edit Contract' : 'Create New Contract'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Contract Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-300">Contract Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Contract title..."
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-gray-300">Contract Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Contract['type'] }))}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTRACT_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-gray-400">{type.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-gray-300">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Contract['status'] }))}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="signed">Signed</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="terms" className="text-gray-300">Contract Terms</Label>
                  <Textarea
                    id="terms"
                    value={formData.terms || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                    placeholder="Key terms and conditions..."
                    className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-gray-300">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Internal notes..."
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Client & Financial Info */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Client & Financial</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client_name" className="text-gray-300">Client Name *</Label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                    placeholder="Client name..."
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_email" className="text-gray-300">Client Email</Label>
                  <Input
                    id="client_email"
                    type="email"
                    value={formData.client_email || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                    placeholder="client@example.com"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_company" className="text-gray-300">Company</Label>
                  <Input
                    id="client_company"
                    value={formData.client_company || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_company: e.target.value }))}
                    placeholder="Company name..."
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency" className="text-gray-300">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map(currency => (
                          <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-gray-300">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date" className="text-gray-300">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date" className="text-gray-300">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowCreateModal(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSaveContract} disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
              {isSubmitting ? 'Saving...' : editingContract ? 'Update Contract' : 'Create Contract'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteContractId} onOpenChange={() => setDeleteContractId(null)}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Contract</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete this contract? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteContractId && handleDeleteContract(deleteContractId)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 
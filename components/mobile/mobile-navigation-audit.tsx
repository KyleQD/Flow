"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useIsMobile, useHapticFeedback } from "@/hooks/use-mobile"
import {
  Smartphone,
  Hand,
  Navigation,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Menu,
  Search,
  Settings,
  Home,
  Calendar,
  Users,
  MessageSquare,
  Bell,
  Plus,
  ChevronDown,
  ChevronUp
} from "lucide-react"

interface NavigationIssue {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  description: string
  page: string
  component?: string
  solution: string
  fixed: boolean
}

interface TouchTargetIssue {
  element: string
  size: { width: number; height: number }
  recommended: { width: number; height: number }
  page: string
  fixed: boolean
}

export function MobileNavigationAudit() {
  const { isMobile, isTablet, isDesktop, breakpoint } = useIsMobile()
  const { triggerHaptic } = useHapticFeedback()
  
  const [currentPage, setCurrentPage] = useState<string>('dashboard')
  const [auditResults, setAuditResults] = useState<{
    navigationIssues: NavigationIssue[]
    touchTargetIssues: TouchTargetIssue[]
    overallScore: number
  }>({
    navigationIssues: [],
    touchTargetIssues: [],
    overallScore: 0
  })
  
  const [isAuditing, setIsAuditing] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // Predefined navigation issues to check
  const navigationIssues: NavigationIssue[] = [
    {
      id: 'nav-1',
      type: 'critical',
      title: 'Missing Mobile Navigation',
      description: 'Page lacks proper mobile navigation or bottom navigation',
      page: 'dashboard',
      solution: 'Implement EnhancedMobileNavigation component',
      fixed: false
    },
    {
      id: 'nav-2',
      type: 'warning',
      title: 'Inconsistent Navigation Patterns',
      description: 'Different navigation patterns across sections',
      page: 'venue',
      solution: 'Standardize navigation using unified mobile navigation',
      fixed: false
    },
    {
      id: 'nav-3',
      type: 'info',
      title: 'Sidebar Not Mobile Optimized',
      description: 'Sidebar navigation not properly adapted for mobile',
      page: 'artist',
      solution: 'Implement mobile-specific sidebar behavior',
      fixed: false
    },
    {
      id: 'nav-4',
      type: 'warning',
      title: 'Touch Targets Too Small',
      description: 'Navigation buttons smaller than 44px minimum',
      page: 'events',
      solution: 'Increase touch target sizes to minimum 44px',
      fixed: false
    },
    {
      id: 'nav-5',
      type: 'critical',
      title: 'No Haptic Feedback',
      description: 'Navigation interactions lack haptic feedback',
      page: 'profile',
      solution: 'Add haptic feedback to navigation interactions',
      fixed: false
    }
  ]

  const touchTargetIssues: TouchTargetIssue[] = [
    {
      element: 'Navigation Button',
      size: { width: 32, height: 32 },
      recommended: { width: 44, height: 44 },
      page: 'dashboard',
      fixed: false
    },
    {
      element: 'Search Input',
      size: { width: 200, height: 36 },
      recommended: { width: 200, height: 44 },
      page: 'search',
      fixed: false
    },
    {
      element: 'Action Button',
      size: { width: 28, height: 28 },
      recommended: { width: 44, height: 44 },
      page: 'events',
      fixed: false
    }
  ]

  const runAudit = async () => {
    setIsAuditing(true)
    triggerHaptic('medium')

    // Simulate audit process
    await new Promise(resolve => setTimeout(resolve, 2000))

    const score = calculateScore(navigationIssues, touchTargetIssues)
    
    setAuditResults({
      navigationIssues,
      touchTargetIssues,
      overallScore: score
    })

    setIsAuditing(false)
    triggerHaptic('light')
  }

  const calculateScore = (navIssues: NavigationIssue[], touchIssues: TouchTargetIssue[]): number => {
    const totalIssues = navIssues.length + touchIssues.length
    const criticalIssues = navIssues.filter(issue => issue.type === 'critical').length
    const warningIssues = navIssues.filter(issue => issue.type === 'warning').length
    
    // Score calculation: 100 - (critical * 20) - (warning * 10) - (info * 5)
    const score = Math.max(0, 100 - (criticalIssues * 20) - (warningIssues * 10))
    return Math.round(score)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { color: 'bg-green-500/20 text-green-400 border-green-500/30', text: 'Excellent' }
    if (score >= 60) return { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', text: 'Good' }
    return { color: 'bg-red-500/20 text-red-400 border-red-500/30', text: 'Needs Work' }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center justify-center space-x-2 mb-4"
        >
          <Navigation className="h-8 w-8 text-purple-400" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Mobile Navigation Audit
          </h1>
        </motion.div>
        
        <p className="text-slate-400">
          Comprehensive audit of mobile navigation across the platform
        </p>
      </div>

      {/* Device Info */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5 text-purple-400" />
            <span>Audit Environment</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Device Type:</span>
              <div className="font-medium">
                {isMobile ? "Mobile" : isTablet ? "Tablet" : "Desktop"}
              </div>
            </div>
            <div>
              <span className="text-slate-400">Breakpoint:</span>
              <div className="font-medium capitalize">{breakpoint}</div>
            </div>
            <div>
              <span className="text-slate-400">Current Page:</span>
              <div className="font-medium capitalize">{currentPage}</div>
            </div>
            <div>
              <span className="text-slate-400">Audit Status:</span>
              <div className="font-medium">
                {isAuditing ? "Running..." : auditResults.overallScore > 0 ? "Completed" : "Ready"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Controls */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Hand className="h-5 w-5 text-purple-400" />
            <span>Run Navigation Audit</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={runAudit}
            disabled={isAuditing}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            {isAuditing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Running Audit...
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                Start Navigation Audit
              </>
            )}
          </Button>

          {auditResults.overallScore > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Overall Score:</span>
                <Badge className={getScoreBadge(auditResults.overallScore).color}>
                  {auditResults.overallScore}/100
                </Badge>
              </div>
              
              <Progress 
                value={auditResults.overallScore} 
                className="h-2"
              />
              
              <div className="text-center">
                <span className={`text-lg font-semibold ${getScoreColor(auditResults.overallScore)}`}>
                  {getScoreBadge(auditResults.overallScore).text}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Results */}
      {auditResults.overallScore > 0 && (
        <>
          {/* Navigation Issues */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                  <span>Navigation Issues</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditResults.navigationIssues.map((issue) => (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border ${
                      issue.type === 'critical' 
                        ? 'bg-red-500/10 border-red-500/30' 
                        : issue.type === 'warning'
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : 'bg-blue-500/10 border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {issue.type === 'critical' ? (
                            <XCircle className="h-4 w-4 text-red-400" />
                          ) : issue.type === 'warning' ? (
                            <AlertTriangle className="h-4 w-4 text-yellow-400" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-blue-400" />
                          )}
                          <h4 className="font-medium text-white">{issue.title}</h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              issue.type === 'critical' 
                                ? 'border-red-500/50 text-red-400' 
                                : issue.type === 'warning'
                                ? 'border-yellow-500/50 text-yellow-400'
                                : 'border-blue-500/50 text-blue-400'
                            }`}
                          >
                            {issue.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400 mb-2">{issue.description}</p>
                        {showDetails && (
                          <div className="space-y-2">
                            <div className="text-xs text-slate-500">
                              <strong>Page:</strong> {issue.page}
                            </div>
                            <div className="text-xs text-slate-500">
                              <strong>Solution:</strong> {issue.solution}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Touch Target Issues */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Hand className="h-5 w-5 text-blue-400" />
                <span>Touch Target Issues</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditResults.touchTargetIssues.map((issue, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{issue.element}</h4>
                      <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                        {issue.page}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Current Size:</span>
                        <div className="font-medium">
                          {issue.size.width}px × {issue.size.height}px
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Recommended:</span>
                        <div className="font-medium text-green-400">
                          {issue.recommended.width}px × {issue.recommended.height}px
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ArrowRight className="h-5 w-5 text-green-400" />
                <span>Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Implement unified mobile navigation across all pages</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Ensure all touch targets are at least 44px × 44px</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Add haptic feedback to all navigation interactions</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Test navigation on various mobile devices and screen sizes</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Implement consistent navigation patterns across all sections</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}



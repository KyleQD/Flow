"use client"

import { useState, useEffect } from 'react'
import { BrandLoadingScreen, TourifyLoading, useBrandLoading } from '@/components/ui/brand-loading-screen'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  Square, 
  Palette, 
  Zap, 
  Sparkles, 
  Radio, 
  Waves, 
  RotateCw,
  Heart,
  Eye,
  Settings,
  Download
} from 'lucide-react'

// =============================================================================
// LOADING VARIANTS DATA
// =============================================================================

const loadingVariants = [
  {
    id: 'glow',
    name: 'Glow Effect',
    description: 'Pulsing glow around the logo',
    icon: Sparkles,
    color: 'text-purple-400',
    recommended: true
  },
  {
    id: 'pulse',
    name: 'Pulse Animation',
    description: 'Gentle scaling pulse effect',
    icon: Heart,
    color: 'text-pink-400',
    recommended: false
  },
  {
    id: 'rotate',
    name: 'Rotating Logo',
    description: 'Smooth continuous rotation',
    icon: RotateCw,
    color: 'text-blue-400',
    recommended: false
  },
  {
    id: 'particles',
    name: 'Particle System',
    description: 'Animated particles around logo',
    icon: Sparkles,
    color: 'text-yellow-400',
    recommended: true
  },
  {
    id: 'waves',
    name: 'Wave Ripples',
    description: 'Expanding wave animations',
    icon: Waves,
    color: 'text-cyan-400',
    recommended: false
  },
  {
    id: 'orbit',
    name: 'Orbital Icons',
    description: 'Platform icons orbiting the logo',
    icon: Radio,
    color: 'text-green-400',
    recommended: true
  },
  {
    id: 'breathe',
    name: 'Breathing Effect',
    description: 'Organic breathing animation with color shifts',
    icon: Zap,
    color: 'text-violet-400',
    recommended: false
  }
]

// =============================================================================
// BRAND LOADING DEMO COMPONENT
// =============================================================================

export function BrandLoadingDemo() {
  const [selectedVariant, setSelectedVariant] = useState<'glow' | 'pulse' | 'rotate' | 'particles' | 'waves' | 'orbit' | 'breathe'>('glow')
  const [showFullScreen, setShowFullScreen] = useState(false)
  const [activeTab, setActiveTab] = useState('variants')
  const [isPlaying, setIsPlaying] = useState(false)
  const [demoProgress, setDemoProgress] = useState(0)

  // Brand loading hook for interactive demo
  const { isLoading, progress, phase, startLoading, stopLoading } = useBrandLoading()

  // Demo progress simulation
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setDemoProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 0
          }
          return prev + 2
        })
      }, 100)
      return () => clearInterval(interval)
    }
  }, [isPlaying])

  // Handle full screen demo
  const handleFullScreenDemo = () => {
    setShowFullScreen(true)
    setTimeout(() => setShowFullScreen(false), 5000) // Auto close after 5 seconds
  }

  // =============================================================================
  // VARIANT SHOWCASE
  // =============================================================================

  const VariantShowcase = () => (
    <div className="space-y-6">
      {/* Variant Selector */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Palette className="mr-2 h-5 w-5" />
            Animation Variants
          </CardTitle>
          <CardDescription>
            Choose from different logo animation styles to match your brand personality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {loadingVariants.map((variant) => {
              const Icon = variant.icon
              return (
                <Button
                  key={variant.id}
                  variant={selectedVariant === variant.id ? "default" : "outline"}
                  size="lg"
                  onClick={() => setSelectedVariant(variant.id as any)}
                  className={`h-auto p-4 flex-col space-y-2 relative ${
                    selectedVariant === variant.id 
                      ? 'bg-purple-600 hover:bg-purple-700 border-purple-500' 
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <Icon className={`h-6 w-6 ${variant.color}`} />
                  <div className="text-center">
                    <div className="font-medium text-sm">{variant.name}</div>
                    <div className="text-xs opacity-70 mt-1">{variant.description}</div>
                  </div>
                  {variant.recommended && (
                    <Badge variant="outline" className="absolute -top-2 -right-2 text-xs bg-green-500/10 text-green-400 border-green-500/30">
                      Popular
                    </Badge>
                  )}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center">
              <Eye className="mr-2 h-5 w-5" />
              Live Preview
            </span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-slate-300"
              >
                {isPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Stop' : 'Play'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFullScreenDemo}
                className="text-slate-300"
              >
                <Zap className="h-4 w-4 mr-1" />
                Full Screen
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Preview the selected animation variant with simulated loading progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <BrandLoadingScreen
                variant={selectedVariant}
                message={`${selectedVariant.charAt(0).toUpperCase() + selectedVariant.slice(1)} Animation`}
                subMessage="Preview of your selected loading style"
                showProgress={isPlaying}
                progress={demoProgress}
                fullScreen={false}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // =============================================================================
  // INTERACTIVE DEMO
  // =============================================================================

  const InteractiveDemo = () => (
    <div className="space-y-6">
      {/* Demo Controls */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Interactive Loading Demo</CardTitle>
          <CardDescription>
            Test the complete loading experience with realistic timing and phases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Loading State</h4>
                <p className="text-sm text-slate-400">
                  Phase: <span className="capitalize">{phase}</span> • Progress: {Math.round(progress)}%
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => startLoading(4000)}
                  disabled={isLoading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Loading
                </Button>
                <Button
                  onClick={stopLoading}
                  variant="outline"
                  disabled={!isLoading}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </div>
            </div>

            <Progress value={progress} className="w-full" />

            {isLoading && (
              <div className="mt-6">
                <BrandLoadingScreen
                  variant={selectedVariant}
                  message="Loading your tour management platform..."
                  subMessage="Please wait while we prepare everything for you"
                  showProgress={true}
                  progress={progress}
                  fullScreen={false}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Integration Examples */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Integration Examples</CardTitle>
          <CardDescription>
            Ready-to-use code examples for different loading scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/50 rounded-lg">
              <h4 className="font-medium text-white mb-2">App Initialization</h4>
              <pre className="text-sm text-slate-300 overflow-x-auto">
{`import { BrandLoadingScreen } from '@/components/ui/brand-loading-screen'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  
  return (
    isLoading ? (
      <BrandLoadingScreen
        variant="glow"
        message="Loading Tourify..."
        showProgress={true}
        onComplete={() => setIsLoading(false)}
      />
    ) : (
      <MainApp />
    )
  )
}`}
              </pre>
            </div>

            <div className="p-4 bg-slate-900/50 rounded-lg">
              <h4 className="font-medium text-white mb-2">Route Transitions</h4>
              <pre className="text-sm text-slate-300 overflow-x-auto">
{`import { TourifyLoading } from '@/components/ui/brand-loading-screen'

function LoadingPage() {
  return (
    <TourifyLoading.Particles
      message="Loading dashboard..."
      fullScreen={false}
    />
  )
}`}
              </pre>
            </div>

            <div className="p-4 bg-slate-900/50 rounded-lg">
              <h4 className="font-medium text-white mb-2">Custom Hook Integration</h4>
              <pre className="text-sm text-slate-300 overflow-x-auto">
{`import { useBrandLoading } from '@/components/ui/brand-loading-screen'

function MyComponent() {
  const { isLoading, startLoading } = useBrandLoading()
  
  const handleDataLoad = async () => {
    const cleanup = startLoading(3000)
    await fetchData()
    cleanup()
  }
  
  return isLoading ? <BrandLoadingScreen /> : <Content />
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // =============================================================================
  // CUSTOMIZATION OPTIONS
  // =============================================================================

  const CustomizationDemo = () => (
    <div className="space-y-6">
      {/* Color Customization */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Color Customization</CardTitle>
          <CardDescription>
            Customize colors to match your brand identity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-white mb-3">Default Brand Colors</h4>
              <BrandLoadingScreen
                variant="glow"
                message="Default Tourify Branding"
                fullScreen={false}
              />
            </div>
            <div>
              <h4 className="font-medium text-white mb-3">Custom Color Scheme</h4>
              <BrandLoadingScreen
                variant="glow"
                message="Custom Brand Colors"
                primaryColor="rgb(34, 197, 94)"
                secondaryColor="rgb(59, 130, 246)"
                fullScreen={false}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo Options */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Logo Integration</CardTitle>
          <CardDescription>
            Use your own logo or customize the default design
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/50 rounded-lg">
              <h4 className="font-medium text-white mb-2">Using Custom Logo</h4>
              <pre className="text-sm text-slate-300 overflow-x-auto">
{`<BrandLoadingScreen
  logoSrc="/path/to/your/logo.png"
  variant="glow"
  message="Loading Your Platform..."
/>`}
              </pre>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-lg">
              <h4 className="font-medium text-white mb-2">Logo Requirements</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• <strong>Format:</strong> PNG, SVG, or WebP recommended</li>
                <li>• <strong>Size:</strong> Square aspect ratio (1:1) works best</li>
                <li>• <strong>Resolution:</strong> At least 200x200px for crisp display</li>
                <li>• <strong>Background:</strong> Transparent background recommended</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <>
      <div className="space-y-6">
        {/* Demo Header */}
        <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Sparkles className="mr-3 h-7 w-7 text-purple-400" />
              Beautiful Brand Loading Screens
            </CardTitle>
            <CardDescription className="text-lg">
              Create stunning first impressions with animated logo-centered loading experiences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-lg">
                <Zap className="h-6 w-6 text-purple-400" />
                <div>
                  <p className="font-medium text-white">7 Animation Styles</p>
                  <p className="text-sm text-slate-400">From subtle to spectacular</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-lg">
                <Settings className="h-6 w-6 text-blue-400" />
                <div>
                  <p className="font-medium text-white">Fully Customizable</p>
                  <p className="text-sm text-slate-400">Colors, logos, messages</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-lg">
                <Download className="h-6 w-6 text-green-400" />
                <div>
                  <p className="font-medium text-white">Production Ready</p>
                  <p className="text-sm text-slate-400">Copy and paste code</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="variants">Animation Variants</TabsTrigger>
            <TabsTrigger value="interactive">Interactive Demo</TabsTrigger>
            <TabsTrigger value="customization">Customization</TabsTrigger>
          </TabsList>

          <TabsContent value="variants" className="mt-6">
            <VariantShowcase />
          </TabsContent>

          <TabsContent value="interactive" className="mt-6">
            <InteractiveDemo />
          </TabsContent>

          <TabsContent value="customization" className="mt-6">
            <CustomizationDemo />
          </TabsContent>
        </Tabs>

        {/* Demo Footer */}
        <Card className="bg-slate-800/30 border-slate-600">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">
                ✨ Beautiful Loading Experiences Ready!
              </h3>
              <p className="text-slate-400 mb-4">
                Your users will love these polished, professional loading screens that make wait times feel shorter.
              </p>
              <div className="flex justify-center space-x-2">
                <Badge variant="outline" className="text-purple-400 border-purple-500/30">
                  7 Animation Styles 🎨
                </Badge>
                <Badge variant="outline" className="text-blue-400 border-blue-500/30">
                  Brand Customizable 🎯
                </Badge>
                <Badge variant="outline" className="text-green-400 border-green-500/30">
                  Production Ready 🚀
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Screen Demo Modal */}
      {showFullScreen && (
        <BrandLoadingScreen
          variant={selectedVariant}
          message="Full Screen Demo"
          subMessage="This is how your users will see the loading screen"
          showProgress={true}
          fullScreen={true}
          onComplete={() => setShowFullScreen(false)}
        />
      )}
    </>
  )
}
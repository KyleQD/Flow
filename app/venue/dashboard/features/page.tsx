import { FeatureGrid } from "../../../components/navigation/feature-grid"
import { TabbedNavigation } from "../../../components/navigation/tabbed-navigation"

export default function FeaturesPage() {
  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-3xl font-bold tracking-tight mb-4">All Features</h1>
        <p className="text-gray-400">Explore all the tools and features available to help you grow your music career</p>
      </div>

      <TabbedNavigation />

      <FeatureGrid />
    </div>
  )
}

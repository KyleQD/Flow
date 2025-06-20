// app/admin/dashboard/components/StatusItem.tsx

// Component for status items
export function StatusItem({ label, value, color }: { label: string; value: number; color: string }) {
  const getColor = () => {
    switch (color) {
      case "purple":
        return "from-purple-500 to-pink-500"
      case "pink":
        return "from-pink-500 to-purple-500"
      case "blue":
        return "from-blue-500 to-indigo-500"
      case "green": // Added for consistency with ActiveEventsList color options
        return "from-green-500 to-teal-500"
      case "yellow": // Added for consistency
        return "from-yellow-500 to-amber-500"
      default:
        return "from-gray-500 to-slate-500" // Default fallback color
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs text-slate-400 truncate" title={label}>{label}</div>
        <div className="text-xs text-slate-400">{value}%</div>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${getColor()} rounded-full`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  )
} 
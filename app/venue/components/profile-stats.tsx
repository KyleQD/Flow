"use client"
import { motion } from "framer-motion"
import type { ProfileData } from "@/lib/venue/types"

interface ProfileStatsProps {
  stats: ProfileData["stats"]
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <div className="bg-gray-900 p-4 flex justify-around rounded-lg mx-4 shadow-sm">
      <StatItem label="Tours" value={stats.tours} />
      <StatItem label="Connections" value={stats.connections.toLocaleString()} />
      <StatItem label="Rating" value={stats.rating} />
    </div>
  )
}

interface StatItemProps {
  label: string
  value: string | number
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
    >
      <motion.p
        className="font-bold text-purple-400"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 10,
          delay: 0.1,
        }}
      >
        {value}
      </motion.p>
      <p className="text-xs text-gray-500">{label}</p>
    </motion.div>
  )
}

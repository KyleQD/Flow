"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReactNode } from "react"

interface FeatureCardProps {
  icon: ReactNode
  label: string
  description: string
  href: string
  badge?: ReactNode
}

export function FeatureCard({ icon, label, description, href, badge }: FeatureCardProps) {
  return (
    <Link href={href} className="block group focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-xl">
      <Card className="rounded-xl shadow-lg border-0 bg-gradient-to-br from-[#191c24] to-[#23263a] group-hover:shadow-2xl group-hover:scale-[1.03] transition-all duration-200 ease-in-out">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <span className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors text-purple-500 group-hover:scale-110 group-hover:shadow-md">
            {icon}
          </span>
          <CardTitle className="text-lg flex items-center gap-2 font-semibold text-white">
            {label}
            {badge}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-400 text-sm pt-0 pb-4 min-h-[40px]">
          {description}
        </CardContent>
      </Card>
    </Link>
  )
} 
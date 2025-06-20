"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface Breadcrumb {
  label: string
  href: string
  active?: boolean
}

interface Breadcrumbs2Props {
  items?: Breadcrumb[]
  className?: string
  showHome?: boolean
}

export function Breadcrumbs2({ items = [], className = "", showHome = true }: Breadcrumbs2Props) {
  const pathname = usePathname()

  // Generate breadcrumbs from pathname if no items provided
  const getBreadcrumbs = () => {
    if (items.length > 0) return items

    const paths = pathname.split("/").filter(Boolean)
    let currentPath = ""

    return paths.map((path, index) => {
      currentPath += `/${path}`
      const isLast = index === paths.length - 1

      return {
        label: path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " "),
        href: currentPath,
        active: isLast,
      }
    })
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb">
      {showHome && (
        <>
          <Link
            href="/"
            className="flex items-center text-gray-500 hover:text-white transition-colors"
            aria-label="Home"
          >
            <Home className="h-4 w-4" />
          </Link>
          {breadcrumbs.length > 0 && (
            <ChevronRight className="h-4 w-4 text-gray-600 flex-shrink-0" aria-hidden="true" />
          )}
        </>
      )}

      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.href} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 text-gray-600 mx-1" aria-hidden="true" />}
            <Link
              href={breadcrumb.href}
              className={`hover:text-white transition-colors ${
                breadcrumb.active ? "text-white font-medium" : "text-gray-500"
              }`}
              aria-current={breadcrumb.active ? "page" : undefined}
            >
              {breadcrumb.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
} 
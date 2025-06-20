// Pagination types
export interface PaginationOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  filter?: Record<string, any>
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
    nextPage: number | null
    prevPage: number | null
  }
}

// Default pagination options
const DEFAULT_PAGINATION_OPTIONS: PaginationOptions = {
  page: 1,
  limit: 10,
  sortBy: "createdAt",
  sortOrder: "desc",
}

// Paginate an array of data
export function paginateArray<T>(data: T[], options: PaginationOptions = {}): PaginatedResult<T> {
  // Merge options with defaults
  const {
    page = 1,
    limit = 10,
    sortBy,
    sortOrder = "desc",
    filter,
  } = {
    ...DEFAULT_PAGINATION_OPTIONS,
    ...options,
  }

  // Apply filters if provided
  let filteredData = [...data]
  if (filter) {
    filteredData = filteredData.filter((item) => {
      return Object.entries(filter).every(([key, value]) => {
        // Handle nested properties with dot notation (e.g., 'user.name')
        const keys = key.split(".")
        let itemValue = item as any

        for (const k of keys) {
          if (itemValue === null || itemValue === undefined) return false
          itemValue = itemValue[k]
        }

        // Handle different types of filters
        if (Array.isArray(value)) {
          return value.includes(itemValue)
        } else if (typeof value === "object" && value !== null) {
          // Handle range filters
          if ("$gt" in value && itemValue <= value.$gt) return false
          if ("$gte" in value && itemValue < value.$gte) return false
          if ("$lt" in value && itemValue >= value.$lt) return false
          if ("$lte" in value && itemValue > value.$lte) return false
          if ("$ne" in value && itemValue === value.$ne) return false
          if ("$in" in value && !value.$in.includes(itemValue)) return false
          if ("$nin" in value && value.$nin.includes(itemValue)) return false
          return true
        } else {
          return itemValue === value
        }
      })
    })
  }

  // Apply sorting if sortBy is provided
  if (sortBy) {
    filteredData.sort((a: any, b: any) => {
      // Handle nested properties with dot notation
      const keys = sortBy.split(".")
      let aValue: any = a
      let bValue: any = b

      for (const key of keys) {
        aValue = aValue?.[key]
        bValue = bValue?.[key]
      }

      // Handle different types of values
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      } else {
        return sortOrder === "asc" ? (aValue > bValue ? 1 : -1) : aValue < bValue ? 1 : -1
      }
    })
  }

  // Calculate pagination values
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const paginatedData = filteredData.slice(startIndex, endIndex)
  const total = filteredData.length
  const totalPages = Math.ceil(total / limit)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  return {
    data: paginatedData,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
    },
  }
}

// Create a cursor-based pagination function
export function cursorPagination<T>(
  data: T[],
  cursor: string | null,
  limit = 10,
  idField = "id",
  sortBy = "createdAt",
  sortOrder: "asc" | "desc" = "desc",
): { data: T[]; nextCursor: string | null } {
  // Sort the data
  const sortedData = [...data].sort((a: any, b: any) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    } else {
      return sortOrder === "asc" ? (aValue > bValue ? 1 : -1) : aValue < bValue ? 1 : -1
    }
  })

  // Find the cursor position
  let startIndex = 0
  if (cursor) {
    const cursorIndex = sortedData.findIndex((item: any) => item[idField] === cursor)
    startIndex = cursorIndex !== -1 ? cursorIndex + 1 : 0
  }

  // Get the paginated data
  const paginatedData = sortedData.slice(startIndex, startIndex + limit)

  // Determine the next cursor
  const nextCursor = paginatedData.length === limit ? (paginatedData[paginatedData.length - 1] as any)[idField] : null

  return {
    data: paginatedData,
    nextCursor,
  }
}

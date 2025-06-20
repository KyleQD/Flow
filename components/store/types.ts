export interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  inventory: number
  status: "active" | "draft"
  createdAt: string
  updatedAt: string
} 
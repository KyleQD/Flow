"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Facebook, Mail, ArrowRight } from "lucide-react"

interface SignupFormProps {
  onComplete: (data: { email: string; password: string; name: string; username: string }) => void
}

interface FormData {
  email: string
  password: string
  name: string
  username: string
}

interface FormErrors {
  email: string
  password: string
  name: string
  username: string
}

export default function SignupForm({ onComplete }: SignupFormProps): React.ReactElement {
  const [formData, setFormData] = React.useState<FormData>({
    email: "",
    password: "",
    name: "",
    username: "",
  })

  const [errors, setErrors] = React.useState<FormErrors>({
    email: "",
    password: "",
    name: "",
    username: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev: FormData) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev: FormErrors) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    let valid = true
    const newErrors = { ...errors }

    if (!formData.email) {
      newErrors.email = "Email is required"
      valid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
      valid = false
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
      valid = false
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
      valid = false
    }

    if (!formData.name) {
      newErrors.name = "Name is required"
      valid = false
    }

    if (!formData.username) {
      newErrors.username = "Username is required"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onComplete(formData)
    }
  }

  return (
    <div className="p-8 bg-[#0c0d10]">
      <div className="flex items-center justify-center mb-8">
        <Image
          src="/placeholder-logo.png"
          alt="Tourify"
          width={180}
          height={40}
          priority
          className="dark:invert"
        />
      </div>
      
      <h2 className="text-2xl font-bold text-center mb-2 text-white">Join Tourify</h2>
      <p className="text-gray-400 text-center mb-8">Connect with the live music community</p>

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="w-full bg-[#13151c] border-gray-800 text-white hover:bg-[#1e2130] transition-all duration-300 hover:border-purple-600 group"
          >
            <Facebook className="h-5 w-5 text-blue-500 mr-2 group-hover:text-blue-400 transition-colors" />
            Facebook
          </Button>
          <Button
            variant="outline"
            className="w-full bg-[#13151c] border-gray-800 text-white hover:bg-[#1e2130] transition-all duration-300 hover:border-purple-600 group"
          >
            <Mail className="h-5 w-5 text-purple-500 mr-2 group-hover:text-purple-400 transition-colors" />
            Google
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="bg-gray-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0c0d10] px-2 text-gray-400">Or sign up with email</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-300 text-sm">
            Full Name
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            className="bg-[#13151c] border-gray-800 text-white focus:border-purple-600 focus:ring-purple-600 h-11 rounded-md"
          />
          {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="username" className="text-gray-300 text-sm">
            Username
          </Label>
          <Input
            id="username"
            name="username"
            placeholder="Choose a username"
            value={formData.username}
            onChange={handleChange}
            className="bg-[#13151c] border-gray-800 text-white focus:border-purple-600 focus:ring-purple-600 h-11 rounded-md"
          />
          {errors.username && <p className="text-red-400 text-xs">{errors.username}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-300 text-sm">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            className="bg-[#13151c] border-gray-800 text-white focus:border-purple-600 focus:ring-purple-600 h-11 rounded-md"
          />
          {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-300 text-sm">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            className="bg-[#13151c] border-gray-800 text-white focus:border-purple-600 focus:ring-purple-600 h-11 rounded-md"
          />
          {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}
          <p className="text-xs text-gray-500">Must be at least 8 characters</p>
        </div>

        <Button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white h-11 rounded-md transition-colors duration-200"
        >
          Create Account
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>

      <p className="text-center text-sm text-gray-400 mt-6">
        Already have an account?{" "}
        <Link 
          href="/auth/login" 
          className="text-purple-500 hover:text-purple-400 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}

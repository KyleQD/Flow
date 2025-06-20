"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { 
  BookOpen, 
  Play, 
  Clock,
  ArrowLeft,
  Search,
  Star,
  Users,
  TrendingUp,
  Award,
  Video,
  FileText,
  Headphones,
  Download,
  ExternalLink
} from "lucide-react"
import Link from "next/link"

const educationCategories = [
  { id: 'marketing', name: 'Marketing & Promotion', count: 24, color: 'bg-pink-600' },
  { id: 'finance', name: 'Finance & Business', count: 18, color: 'bg-green-600' },
  { id: 'legal', name: 'Legal & Contracts', count: 12, color: 'bg-purple-600' },
  { id: 'production', name: 'Music Production', count: 32, color: 'bg-blue-600' },
  { id: 'industry', name: 'Industry Insights', count: 15, color: 'bg-orange-600' },
  { id: 'social', name: 'Social Media', count: 21, color: 'bg-cyan-600' }
]

const featuredCourses = [
  {
    id: 1,
    title: "Building Your Music Brand",
    description: "Learn how to create a compelling brand identity that resonates with your target audience.",
    instructor: "Sarah Marketing Expert",
    duration: "3.5 hours",
    lessons: 12,
    rating: 4.8,
    students: 2340,
    category: "Marketing",
    level: "Beginner",
    type: "video",
    thumbnail: "/course-thumbnails/branding.jpg"
  },
  {
    id: 2,
    title: "Music Business Fundamentals",
    description: "Master the business side of music including contracts, royalties, and revenue streams.",
    instructor: "Mike Industry Pro",
    duration: "5.2 hours",
    lessons: 18,
    rating: 4.9,
    students: 1850,
    category: "Business",
    level: "Intermediate",
    type: "video",
    thumbnail: "/course-thumbnails/business.jpg"
  },
  {
    id: 3,
    title: "Social Media Strategy for Musicians",
    description: "Build an engaged following and convert fans into paying customers across all platforms.",
    instructor: "Emma Social Media",
    duration: "2.8 hours",
    lessons: 15,
    rating: 4.7,
    students: 3200,
    category: "Social Media",
    level: "Beginner",
    type: "video",
    thumbnail: "/course-thumbnails/social.jpg"
  }
]

const quickResources = [
  {
    title: "Music Contract Templates",
    description: "Professional contract templates for performances, collaborations, and licensing.",
    type: "download",
    category: "Legal",
    downloads: 15600
  },
  {
    title: "Revenue Tracking Spreadsheet",
    description: "Track your income from multiple sources with this comprehensive template.",
    type: "download",
    category: "Finance",
    downloads: 8900
  },
  {
    title: "Social Media Content Calendar",
    description: "Plan and schedule your social media content for maximum engagement.",
    type: "download",
    category: "Marketing",
    downloads: 12400
  },
  {
    title: "Industry Salary Report 2024",
    description: "Latest salary data and trends in the music industry.",
    type: "report",
    category: "Industry",
    downloads: 5600
  }
]

const webinars = [
  {
    title: "Live: Streaming Revenue Optimization",
    date: "Dec 15, 2024",
    time: "2:00 PM PST",
    speaker: "Revenue Expert John",
    attendees: 340,
    status: "upcoming"
  },
  {
    title: "Q&A: Building Your First Tour",
    date: "Dec 18, 2024",
    time: "7:00 PM EST",
    speaker: "Tour Manager Lisa",
    attendees: 180,
    status: "upcoming"
  },
  {
    title: "Masterclass: Digital Marketing ROI",
    date: "Dec 12, 2024",
    time: "1:00 PM PST",
    speaker: "Marketing Pro Alex",
    attendees: 520,
    status: "completed"
  }
]

export default function BusinessEducationPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCourses = featuredCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || course.category.toLowerCase() === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/artist/business">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Business
            </Button>
          </Link>
          <div className="h-8 w-px bg-slate-700"></div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Business Education</h1>
              <p className="text-gray-400">Learn skills to grow your music business</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-[250px] bg-slate-800/50 border-slate-700/50 text-white"
            />
          </div>
          <Button className="bg-yellow-600 hover:bg-yellow-700">
            <Award className="h-4 w-4 mr-2" />
            My Certificates
          </Button>
        </div>
      </div>

      {/* Categories */}
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Learning Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {educationCategories.map((category) => (
              <div
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                  selectedCategory === category.id ? 'ring-2 ring-yellow-500' : ''
                }`}
                style={{ background: `linear-gradient(135deg, ${category.color}20, ${category.color}10)` }}
              >
                <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mb-3`}>
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-medium text-white text-sm mb-1">{category.name}</h3>
                <p className="text-xs text-gray-400">{category.count} resources</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Featured Courses */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold text-white">Featured Courses</h2>
          
          <div className="space-y-4">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="bg-slate-900/50 border-slate-700/50 hover:border-yellow-500/50 transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <Video className="h-8 w-8 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">{course.title}</h3>
                          <p className="text-gray-400 text-sm mb-2">{course.description}</p>
                        </div>
                        <Badge className="bg-yellow-600/20 text-yellow-300">
                          {course.level}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Play className="h-3 w-3" />
                          {course.lessons} lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400" />
                          {course.rating} ({course.students.toLocaleString()} students)
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-300">
                          by {course.instructor}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="border-slate-700">
                            Preview
                          </Button>
                          <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                            Start Learning
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Webinars */}
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Upcoming Webinars</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webinars.filter(w => w.status === 'upcoming').map((webinar, index) => (
                  <div key={index} className="p-3 bg-slate-800/50 rounded-lg">
                    <h4 className="font-medium text-white text-sm mb-1">{webinar.title}</h4>
                    <div className="text-xs text-gray-400 mb-2">
                      {webinar.date} at {webinar.time}
                    </div>
                    <div className="text-xs text-gray-400 mb-2">
                      by {webinar.speaker}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{webinar.attendees} registered</span>
                      <Button size="sm" variant="outline" className="text-xs border-slate-700">
                        Register
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Resources */}
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Quick Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quickResources.map((resource, index) => (
                  <div key={index} className="p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded bg-yellow-600/20">
                        {resource.type === 'download' ? (
                          <Download className="h-4 w-4 text-yellow-400" />
                        ) : (
                          <FileText className="h-4 w-4 text-yellow-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white text-sm mb-1">{resource.title}</h4>
                        <p className="text-xs text-gray-400 mb-2">{resource.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs bg-blue-600/20 text-blue-300">
                            {resource.category}
                          </Badge>
                          <span className="text-xs text-gray-500">{resource.downloads.toLocaleString()} downloads</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Learning Progress */}
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Courses Completed</span>
                    <span className="text-sm font-medium text-white">3/10</span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Certificates Earned</span>
                    <span className="text-sm font-medium text-white">2</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-400" />
                    <Award className="h-4 w-4 text-yellow-400" />
                    <Award className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Total Learning Time</span>
                    <span className="text-sm font-medium text-white">24.5 hours</span>
                  </div>
                  <div className="text-xs text-gray-400">This month: 8.2 hours</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Learning Paths */}
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Recommended Learning Paths</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Music Business Mastery",
                description: "Complete guide to building a sustainable music business",
                courses: 8,
                duration: "12 hours",
                level: "Beginner to Advanced"
              },
              {
                title: "Digital Marketing Pro",
                description: "Master online marketing and social media for musicians",
                courses: 6,
                duration: "9 hours",
                level: "Intermediate"
              },
              {
                title: "Financial Management",
                description: "Learn to manage money, contracts, and revenue streams",
                courses: 5,
                duration: "7 hours",
                level: "Beginner"
              }
            ].map((path, index) => (
              <div key={index} className="p-4 bg-slate-800/50 rounded-lg">
                <h3 className="font-semibold text-white mb-2">{path.title}</h3>
                <p className="text-sm text-gray-400 mb-3">{path.description}</p>
                <div className="space-y-2 text-xs text-gray-500 mb-4">
                  <div>{path.courses} courses • {path.duration}</div>
                  <div>{path.level}</div>
                </div>
                <Button size="sm" className="w-full bg-yellow-600 hover:bg-yellow-700">
                  Start Path
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
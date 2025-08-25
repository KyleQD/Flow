"use client"

import { useState } from "react"
import { Briefcase, Plus, Star, Calendar, Award, Edit, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import ProfessionSelector from "../../components/profession-selector"
import { mockProfessions } from "../../../lib/mock-data"
import type { UserProfession } from "@/lib/venue/types"
import { useToast } from "@/hooks/use-toast"

// Add this interface and mock data for placeholder
interface MockProfession {
  id: string
  name: string
  category: string
  skillsRequired?: string[]
}

const professions: MockProfession[] = (mockProfessions as MockProfession[])

// Mock user professions for demo
const initialUserProfessions = [
  {
    professionId: "prof-1",
    userId: "user-1",
    yearsExperience: 5,
    isPrimary: true,
    skills: ["Tour Management", "Artist Relations", "Event Production", "Sound Engineering"],
    portfolioItems: ["content-1", "content-4"],
  },
]

export default function ProfessionsPage() {
  const [userProfessions, setUserProfessions] = useState(initialUserProfessions)
  const [selectedProfessionIds, setSelectedProfessionIds] = useState<string[]>(
    initialUserProfessions.map((p) => p.professionId),
  )
  const [isAddingSkill, setIsAddingSkill] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const [editingProfessionId, setEditingProfessionId] = useState<string | null>(null)
  const [yearsExperience, setYearsExperience] = useState<number>(0)
  const { toast } = useToast()

  const handleProfessionSelection = (professionIds: string[]) => {
    setSelectedProfessionIds(professionIds)

    // Add new professions that weren't in userProfessions before
    const newProfessions = professionIds.filter((id) => !userProfessions.some((up) => up.professionId === id))

    if (newProfessions.length > 0) {
      const updatedProfessions = [
        ...userProfessions,
        ...newProfessions.map((id) => ({
          professionId: id,
          userId: "user-1", // Mock user ID
          yearsExperience: 0,
          isPrimary: userProfessions.length === 0, // Make primary if it's the first profession
          skills: [],
          portfolioItems: [],
        })),
      ]

      setUserProfessions(updatedProfessions)
    }

    // Remove professions that were unselected
    const remainingProfessions = userProfessions.filter((up) => professionIds.includes(up.professionId))

    if (remainingProfessions.length < userProfessions.length) {
      setUserProfessions(remainingProfessions)

      // If the primary profession was removed, set a new one
      if (remainingProfessions.length > 0 && !remainingProfessions.some((p) => p.isPrimary)) {
        const updatedWithPrimary = remainingProfessions.map((p, index) => ({
          ...p,
          isPrimary: index === 0, // Make the first one primary
        }))

        setUserProfessions(updatedWithPrimary)
      }
    }
  }

  const handleSetPrimary = (professionId: string) => {
    const updatedProfessions = userProfessions.map((p) => ({
      ...p,
      isPrimary: p.professionId === professionId,
    }))

    setUserProfessions(updatedProfessions)
  }

  const handleAddSkill = (professionId: string) => {
    if (!newSkill.trim()) return

    const updatedProfessions = userProfessions.map((p) => {
      if (p.professionId === professionId) {
        return {
          ...p,
          skills: [...p.skills, newSkill.trim()],
        }
      }
      return p
    })

    setUserProfessions(updatedProfessions)
    setNewSkill("")
    setIsAddingSkill(false)
  }

  const handleRemoveSkill = (professionId: string, skillToRemove: string) => {
    const updatedProfessions = userProfessions.map((p) => {
      if (p.professionId === professionId) {
        return {
          ...p,
          skills: p.skills.filter((skill) => skill !== skillToRemove),
        }
      }
      return p
    })

    setUserProfessions(updatedProfessions)
  }

  const handleUpdateExperience = () => {
    if (editingProfessionId === null) return

    const updatedProfessions = userProfessions.map((p) => {
      if (p.professionId === editingProfessionId) {
        return {
          ...p,
          yearsExperience,
        }
      }
      return p
    })

    setUserProfessions(updatedProfessions)
    setEditingProfessionId(null)
  }

  const startEditingExperience = (professionId: string, years: number) => {
    setEditingProfessionId(professionId)
    setYearsExperience(years)
  }

  const getProfessionById = (id: string) => {
    return professions.find((p) => p.id === id)
  }

  const handleProfessionAdd = (profession: UserProfession) => {
    // If this is marked as primary, update all others to not be primary
    let updatedProfessions = [...userProfessions]

    if (profession.isPrimary) {
      updatedProfessions = updatedProfessions.map((p) => ({
        ...p,
        isPrimary: false,
      }))
    }

    setUserProfessions([...updatedProfessions, profession])
    toast({
      title: "Profession added",
      description: "Your profession has been added to your profile.",
    })
  }

  const handleProfessionUpdate = (updatedProfession: UserProfession) => {
    // If this is marked as primary, update all others to not be primary
    let updatedProfessions = [...userProfessions]

    if (updatedProfession.isPrimary) {
      updatedProfessions = updatedProfessions.map((p) => ({
        ...p,
        isPrimary: p.professionId === updatedProfession.professionId ? true : false,
      }))
    } else {
      updatedProfessions = updatedProfessions.map((p) =>
        p.professionId === updatedProfession.professionId ? updatedProfession : p,
      )
    }

    setUserProfessions(updatedProfessions)
    toast({
      title: "Profession updated",
      description: "Your profession has been updated.",
    })
  }

  const handleProfessionRemove = (professionId: string) => {
    setUserProfessions(userProfessions.filter((p) => p.professionId !== professionId))
    toast({
      title: "Profession removed",
      description: "Your profession has been removed from your profile.",
    })
  }

  const getProfessionDetails = (professionId: string) => {
    return professions.find((p) => p.id === professionId)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Professions</h1>
          <p className="text-muted-foreground mt-1">Manage your professional roles and expertise</p>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Profession
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add Professional Roles</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Select your professions</h3>
                <ProfessionSelector
                  selectedProfessions={selectedProfessionIds}
                  onChange={handleProfessionSelection}
                  maxSelections={5}
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {userProfessions.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No professions added yet</h2>
          <p className="mt-2 text-muted-foreground">Add your professional roles to showcase your expertise</p>
          <Sheet>
            <SheetTrigger asChild>
              <Button className="mt-6">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Profession
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add Professional Roles</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Select your professions</h3>
                  <ProfessionSelector
                    selectedProfessions={selectedProfessionIds}
                    onChange={handleProfessionSelection}
                    maxSelections={5}
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      ) : (
        <div className="space-y-6">
          {userProfessions.map((profession) => {
            const professionDetails = getProfessionById(profession.professionId)
            if (!professionDetails) return null

            return (
              <Card key={profession.professionId} className={profession.isPrimary ? "border-primary" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <CardTitle className="text-xl">{professionDetails.name}</CardTitle>
                        {profession.isPrimary && (
                          <Badge variant="default" className="ml-2">
                            <Star className="h-3 w-3 mr-1" /> Primary
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="mt-1">{professionDetails.category}</CardDescription>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!profession.isPrimary && (
                        <Button variant="outline" size="sm" onClick={() => handleSetPrimary(profession.professionId)}>
                          Set as Primary
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Experience
                      </h3>

                      {editingProfessionId === profession.professionId ? (
                        <div className="flex items-center mt-1">
                          <Input
                            type="number"
                            min="0"
                            max="50"
                            value={yearsExperience}
                            onChange={(e) => setYearsExperience(Number.parseInt(e.target.value) || 0)}
                            className="w-20 mr-2"
                          />
                          <span className="mr-2">years</span>
                          <Button size="sm" variant="ghost" onClick={handleUpdateExperience}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingProfessionId(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="flex items-center mt-1 cursor-pointer hover:text-primary"
                          onClick={() => startEditingExperience(profession.professionId, profession.yearsExperience)}
                        >
                          <p className="text-lg font-semibold">{profession.yearsExperience}</p>
                          <span className="ml-1 text-sm text-muted-foreground">
                            {profession.yearsExperience === 1 ? "year" : "years"}
                          </span>
                          <Edit className="h-3 w-3 ml-2" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-medium flex items-center">
                        <Award className="h-4 w-4 mr-1" />
                        Skills
                      </h3>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {profession.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="px-2 py-1">
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(profession.professionId, skill)}
                              className="ml-1 text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}

                        {isAddingSkill ? (
                          <div className="flex items-center">
                            <Input
                              value={newSkill}
                              onChange={(e) => setNewSkill(e.target.value)}
                              placeholder="Enter skill"
                              className="w-40 h-8"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleAddSkill(profession.professionId)
                                }
                              }}
                            />
                            <Button size="sm" variant="ghost" onClick={() => handleAddSkill(profession.professionId)}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setIsAddingSkill(false)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => setIsAddingSkill(true)} className="h-7">
                            <Plus className="h-3 w-3 mr-1" />
                            Add Skill
                          </Button>
                        )}
                      </div>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="required-skills">
                        <AccordionTrigger className="text-sm font-medium py-1">Recommended Skills</AccordionTrigger>
                        <AccordionContent>
                          <div className="text-sm text-muted-foreground">
                            <p className="mb-2">These skills are commonly associated with this profession:</p>
                            <div className="flex flex-wrap gap-2">
                              {professionDetails.skillsRequired?.map((skill) => (
                                <Badge key={skill} variant="outline" className="px-2 py-1">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

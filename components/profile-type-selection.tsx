"use client"

import { Button } from "@/components/ui/button"
import { Building2, Headphones, Mic, User, ChevronDown, ArrowRight } from "lucide-react"
import { useState } from "react"
import ProfileInfoModal from "./profile-info-modal"

interface ProfileTypeSelectionProps {
  onSelect: (type: string) => void
}

export default function ProfileTypeSelection({ onSelect }: ProfileTypeSelectionProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalProfileType, setModalProfileType] = useState<string>("")

  const handleSelect = (type: string) => {
    setSelectedType(type)
    onSelect(type)
  }

  const openInfoModal = (type: string) => {
    setModalProfileType(type)
    setModalOpen(true)
  }

  return (
    <div className="p-8 text-white">
      <h2 className="text-3xl font-bold text-center mb-2">Choose Your Profile Type</h2>
      <p className="text-gray-400 text-center mb-8">
        Select the profile that best represents your role in the music community
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Artist Profile */}
        <div className="bg-[#0f1117] rounded-xl p-6 border border-gray-800 relative overflow-hidden group hover:border-purple-500 transition-all duration-300 hover:shadow-[0_0_20px_rgba(147,51,234,0.2)]">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-blue-900/10 z-0"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-600/20 to-blue-600/5 rounded-full blur-3xl transform translate-x-10 -translate-y-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <div className="h-14 w-14 bg-gradient-to-br from-[#6d28d9] to-[#4f46e5] rounded-xl flex items-center justify-center mr-4 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                <Mic className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Artist Profile</h3>
                <p className="text-[#9333ea]">$20/month</p>
              </div>
            </div>

            <p className="text-gray-300 mb-6">
              For artists ready to take control of their career. Whether you're a solo act, band, or DJ— Tourify gives
              you the full toolkit to manage your brand, monetize your audience, and book your future.
            </p>

            <div className="flex flex-col space-y-3">
              <Button
                variant="outline"
                className="bg-[#1e1e2d] border-[#4f46e5]/30 text-[#a5b4fc] hover:bg-[#252538] hover:border-[#4f46e5]/50 w-fit group/btn"
                size="sm"
                onClick={() => openInfoModal("artist")}
              >
                Learn More <ChevronDown className="h-4 w-4 ml-1 group-hover/btn:translate-y-0.5 transition-transform" />
              </Button>

              <Button
                className="w-full bg-gradient-to-r from-[#6d28d9] to-[#4f46e5] hover:from-[#5b21b6] hover:to-[#4338ca] border-0 shadow-[0_4px_20px_rgba(79,70,229,0.3)] transition-all duration-300 group/arrow"
                onClick={() => handleSelect("artist")}
              >
                Start Your Artist Journey
                <ArrowRight className="ml-2 h-4 w-4 group-hover/arrow:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>

        {/* Venue Profile */}
        <div className="bg-[#0f1117] rounded-xl p-6 border border-gray-800 relative overflow-hidden group hover:border-purple-500 transition-all duration-300 hover:shadow-[0_0_20px_rgba(147,51,234,0.2)]">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-blue-900/10 z-0"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-600/20 to-blue-600/5 rounded-full blur-3xl transform translate-x-10 -translate-y-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <div className="h-14 w-14 bg-gradient-to-br from-[#6d28d9] to-[#4f46e5] rounded-xl flex items-center justify-center mr-4 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Venue Profile</h3>
                <p className="text-[#9333ea]">$20/month</p>
              </div>
            </div>

            <p className="text-gray-300 mb-6">
              For spaces that host unforgettable shows. From bars to arenas, Tourify gives venues powerful tools to
              streamline operations, simplify booking, fill your calendar, and grow your reputation.
            </p>

            <div className="flex flex-col space-y-3">
              <Button
                variant="outline"
                className="bg-[#1e1e2d] border-[#4f46e5]/30 text-[#a5b4fc] hover:bg-[#252538] hover:border-[#4f46e5]/50 w-fit group/btn"
                size="sm"
                onClick={() => openInfoModal("venue")}
              >
                Learn More <ChevronDown className="h-4 w-4 ml-1 group-hover/btn:translate-y-0.5 transition-transform" />
              </Button>

              <Button
                className="w-full bg-gradient-to-r from-[#6d28d9] to-[#4f46e5] hover:from-[#5b21b6] hover:to-[#4338ca] border-0 shadow-[0_4px_20px_rgba(79,70,229,0.3)] transition-all duration-300 group/arrow"
                onClick={() => handleSelect("venue")}
              >
                Elevate Your Venue
                <ArrowRight className="ml-2 h-4 w-4 group-hover/arrow:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>

        {/* Industry Profile */}
        <div className="bg-[#0f1117] rounded-xl p-6 border border-gray-800 relative overflow-hidden group hover:border-purple-500 transition-all duration-300 hover:shadow-[0_0_20px_rgba(147,51,234,0.2)]">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-blue-900/10 z-0"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-600/20 to-blue-600/5 rounded-full blur-3xl transform translate-x-10 -translate-y-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <div className="h-14 w-14 bg-gradient-to-br from-[#6d28d9] to-[#4f46e5] rounded-xl flex items-center justify-center mr-4 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                <Headphones className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Industry Profile</h3>
                <p className="text-green-400">Free to Join</p>
              </div>
            </div>

            <p className="text-gray-300 mb-6">
              For the people who make shows happen. Photographers, dancers, A/V techs, stagehands, lighting designers,
              and more can showcase their work, build their reputation, and get hired.
            </p>

            <div className="flex flex-col space-y-3">
              <Button
                variant="outline"
                className="bg-[#1e1e2d] border-[#4f46e5]/30 text-[#a5b4fc] hover:bg-[#252538] hover:border-[#4f46e5]/50 w-fit group/btn"
                size="sm"
                onClick={() => openInfoModal("industry")}
              >
                Learn More <ChevronDown className="h-4 w-4 ml-1 group-hover/btn:translate-y-0.5 transition-transform" />
              </Button>

              <Button
                className="w-full bg-gradient-to-r from-[#6d28d9] to-[#4f46e5] hover:from-[#5b21b6] hover:to-[#4338ca] border-0 shadow-[0_4px_20px_rgba(79,70,229,0.3)] transition-all duration-300 group/arrow"
                onClick={() => handleSelect("industry")}
              >
                Showcase Your Talent
                <ArrowRight className="ml-2 h-4 w-4 group-hover/arrow:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>

        {/* General Profile */}
        <div className="bg-[#0f1117] rounded-xl p-6 border border-gray-800 relative overflow-hidden group hover:border-purple-500 transition-all duration-300 hover:shadow-[0_0_20px_rgba(147,51,234,0.2)]">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-blue-900/10 z-0"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-600/20 to-blue-600/5 rounded-full blur-3xl transform translate-x-10 -translate-y-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <div className="h-14 w-14 bg-gradient-to-br from-[#6d28d9] to-[#4f46e5] rounded-xl flex items-center justify-center mr-4 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                <User className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">General Profile</h3>
                <p className="text-green-400">Always Free</p>
              </div>
            </div>

            <p className="text-gray-300 mb-6">
              For fans, explorers, and community builders. Music lovers can sign up for free to discover artists,
              connect with other fans, and enjoy a personalized live music experience.
            </p>

            <div className="flex flex-col space-y-3">
              <Button
                variant="outline"
                className="bg-[#1e1e2d] border-[#4f46e5]/30 text-[#a5b4fc] hover:bg-[#252538] hover:border-[#4f46e5]/50 w-fit group/btn"
                size="sm"
                onClick={() => openInfoModal("general")}
              >
                Learn More <ChevronDown className="h-4 w-4 ml-1 group-hover/btn:translate-y-0.5 transition-transform" />
              </Button>

              <Button
                className="w-full bg-gradient-to-r from-[#6d28d9] to-[#4f46e5] hover:from-[#5b21b6] hover:to-[#4338ca] border-0 shadow-[0_4px_20px_rgba(79,70,229,0.3)] transition-all duration-300 group/arrow"
                onClick={() => handleSelect("general")}
              >
                Start Discovering
                <ArrowRight className="ml-2 h-4 w-4 group-hover/arrow:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Info Modal */}
      <ProfileInfoModal isOpen={modalOpen} onClose={() => setModalOpen(false)} profileType={modalProfileType} />
    </div>
  )
}

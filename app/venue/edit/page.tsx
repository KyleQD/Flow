"use client"

import { ProfileProvider } from "../../context/profile-context"
import { EditProfileContent } from "../../components/edit-profile-content"

export default function EditProfilePage() {
  return (
    <ProfileProvider>
      <EditProfileContent />
    </ProfileProvider>
  )
}

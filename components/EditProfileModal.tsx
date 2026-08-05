// components/EditProfileModal.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserProfile } from '@/lib/types'

interface EditProfileModalProps {
  profile: UserProfile
  isOpen: boolean
  onClose: () => void
  onProfileUpdated: (updatedProfile: UserProfile) => void
}

export default function EditProfileModal({
  profile,
  isOpen,
  onClose,
  onProfileUpdated,
}: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState(profile.username || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()

  if (!isOpen) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let avatarUrl = profile.avatar_url

      // Upload avatar to Supabase Storage if a new file is chosen
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const filePath = `avatars/${profile.id}-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true })

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)

        avatarUrl = publicUrlData.publicUrl
      }

      // Update Postgres profiles table
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: displayName,
          bio,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
        .select()
        .single()

      if (error) throw error

      onProfileUpdated(data)
      onClose()
    } catch (err: any) {
      alert('Error updating profile: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-neutral-900 p-6 border border-neutral-800 text-white shadow-2xl">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">
              Profile Picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="Your Name"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Tell the world about yourself..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-neutral-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-black bg-white rounded-lg hover:bg-neutral-200 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
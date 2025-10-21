'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useTranslation } from 'react-i18next'
import { useProfile } from '@/contexts/ProfileContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import OnboardingGuard from '@/components/OnboardingGuard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  Edit3,
  X,
  Upload
} from 'lucide-react'
import toast from 'react-hot-toast'

function ProfileContent() {
  const { data: session, update } = useSession()
  const { profileImage, profileData, updateProfileImage, updateProfileData } = useProfile()
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [localProfileImage, setLocalProfileImage] = useState(profileImage)
  const fileInputRef = useRef(null)

  const [profile, setProfile] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    location: '',
    bio: '',
    dateOfBirth: '',
    occupation: ''
  })

  // Update local state when profileData changes
  useEffect(() => {
    if (profileData) {
      setProfile(profileData)
    }
    setLocalProfileImage(profileImage)
  }, [profileData, profileImage])

  // Load existing profile data
  useEffect(() => {
    if (!profileData && session?.user?.email) {
      // Profile data will be loaded by ProfileContext
      // Just set session fallback data
      setProfile({
        name: session?.user?.name || '',
        email: session?.user?.email || '',
        phone: '',
        location: '',
        bio: '',
        dateOfBirth: '',
        occupation: ''
      })
      setLocalProfileImage(session?.user?.image || '')
    }
  }, [session, profileData])

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(t('profile.imageSizeError'))
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setLocalProfileImage(e.target.result)
        toast.success(t('profile.photoUpdated'))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profile,
          image: localProfileImage
        })
      })

      const data = await response.json()

      if (data.success) {
        setIsEditing(false)
        toast.success(t('profile.profileUpdated'))

        // Update the profile context with new data
        updateProfileData(data.profile)
      } else {
        throw new Error(data.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset to original values
    setProfile(profileData || {
      name: session?.user?.name || '',
      email: session?.user?.email || '',
      phone: '',
      location: '',
      bio: '',
      dateOfBirth: '',
      occupation: ''
    })
    setLocalProfileImage(profileImage)
    setIsEditing(false)
  }

  return (
    <DashboardLayout title={t('dashboard.profile')}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-600" />
                  {t('profile.myProfile')}
                </CardTitle>
                <CardDescription className="hidden md:block">
                  {t('profile.managePersonalInfo')}
                </CardDescription>
              </div>

              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  {t('profile.editProfile')}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {saving ? t('profile.saving') : t('common.save')}
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4" />
                    {t('common.cancel')}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Photo Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={localProfileImage} />
                    <AvatarFallback className="text-3xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold">
                      {profile.name ? profile.name[0]?.toUpperCase() : session?.user?.name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  {isEditing && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-2 shadow-lg transition-colors"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {t('profile.changePhoto')}
                  </Button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Profile Information */}
              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('profile.fullName')}</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        placeholder={t('profile.enterFullName')}
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-slate-800">
                        <User className="h-4 w-4 text-slate-500" />
                        <span>{profile.name || t('profile.notProvided')}</span>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('profile.emailAddress')}</Label>
                    <div className="flex items-center gap-2 text-slate-800">
                      <Mail className="h-4 w-4 text-slate-500" />
                      <span>{profile.email}</span>
                      <span className="text-xs text-slate-500">{t('profile.cannotBeChanged')}</span>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('profile.phoneNumber')}</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-slate-800">
                        <Phone className="h-4 w-4 text-slate-500" />
                        <span>{profile.phone || t('profile.notProvided')}</span>
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">{t('profile.location')}</Label>
                    {isEditing ? (
                      <Input
                        id="location"
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        placeholder="Mumbai, Maharashtra"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-slate-800">
                        <MapPin className="h-4 w-4 text-slate-500" />
                        <span>{profile.location || t('profile.notProvided')}</span>
                      </div>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">{t('profile.dateOfBirth')}</Label>
                    {isEditing ? (
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={profile.dateOfBirth}
                        onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                      />
                    ) : (
                      <div className="text-slate-800">
                        {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-IN') : t('profile.notProvided')}
                      </div>
                    )}
                  </div>

                  {/* Occupation */}
                  <div className="space-y-2">
                    <Label htmlFor="occupation">{t('profile.occupation')}</Label>
                    {isEditing ? (
                      <Input
                        id="occupation"
                        value={profile.occupation}
                        onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                        placeholder="Software Engineer"
                      />
                    ) : (
                      <div className="text-slate-800">
                        {profile.occupation || t('profile.notProvided')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">{t('profile.aboutMe')}</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      placeholder={t('profile.tellAboutYourself')}
                      rows={3}
                    />
                  ) : (
                    <div className="text-slate-800 bg-slate-50 p-3 rounded-lg min-h-[80px]">
                      {profile.bio || t('profile.noBioProvided')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">{t('profile.accountActions')}</CardTitle>
            <CardDescription>
              {t('profile.manageAccountSettings')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-2"
              >
                {t('profile.signOut')}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  if (confirm(t('profile.deleteAccountConfirm'))) {
                    toast.error(t('profile.deleteAccountSoon'))
                  }
                }}
                className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
              >
                {t('profile.deleteAccount')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function ProfilePage() {
  return (
    <OnboardingGuard>
      <ProfileContent />
    </OnboardingGuard>
  )
}

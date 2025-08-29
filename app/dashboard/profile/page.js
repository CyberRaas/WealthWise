'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
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
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profileImage, setProfileImage] = useState(session?.user?.image || '')
  const fileInputRef = useRef(null)
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    dateOfBirth: '',
    occupation: ''
  })

  // Load user profile data on component mount
  useEffect(() => {
    loadUserProfile()
  }, [session])

  const loadUserProfile = async () => {
    if (!session?.user) return
    
    try {
      const response = await fetch('/api/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load profile')
      }

      const data = await response.json()
      const user = data.data.user

      // Update profile state with loaded data
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.profile?.location || user.profile?.city || '',
        bio: user.profile?.bio || '',
        dateOfBirth: user.profile?.dateOfBirth || '',
        occupation: user.profile?.occupation || ''
      })

      // Update profile image if different from session
      if (user.avatar && user.avatar !== session?.user?.image) {
        setProfileImage(user.avatar)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      // Fallback to session data
      setProfile({
        name: session?.user?.name || '',
        email: session?.user?.email || '',
        phone: '',
        location: '',
        bio: '',
        dateOfBirth: '',
        occupation: ''
      })
    }
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target.result)
        toast.success('Profile photo updated!')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    
    // Debug logging
    console.log('Session data:', session)
    console.log('User ID:', session?.user?.id)
    console.log('Profile data to save:', profile)
    console.log('Profile image changed:', profileImage !== session?.user?.image)
    
    try {
      // Prepare data according to API schema
      const updateData = {
        name: profile.name,
        phone: profile.phone || undefined,
        avatar: profileImage !== session?.user?.image ? profileImage : undefined,
        profile: {
          location: profile.location || undefined,
          occupation: profile.occupation || undefined,
          bio: profile.bio || undefined,
          dateOfBirth: profile.dateOfBirth || undefined
        }
      }

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key]
        }
      })

      if (updateData.profile) {
        Object.keys(updateData.profile).forEach(key => {
          if (updateData.profile[key] === undefined) {
            delete updateData.profile[key]
          }
        })
        
        // Remove profile object if empty
        if (Object.keys(updateData.profile).length === 0) {
          delete updateData.profile
        }
      }

      console.log('Sending update data:', updateData)

      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      const responseData = await response.json()
      console.log('API Response:', responseData)
      console.log('Response status:', response.status)

      if (!response.ok) {
        throw new Error(responseData.message || `Server error: ${response.status}`)
      }

      const result = responseData
      setIsEditing(false)
      
      // Reload profile data to get the latest from database
      await loadUserProfile()
      
      toast.success('Profile updated successfully! 🎉')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error(error.message || 'Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset to loaded data by reloading from API
    loadUserProfile()
    setIsEditing(false)
  }

  return (
    <DashboardLayout title="Profile">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-600" />
                  My Profile
                </CardTitle>
                <CardDescription>
                  Manage your personal information and preferences
                </CardDescription>
              </div>
              
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
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
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4" />
                    Cancel
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
                    <AvatarImage src={profileImage} />
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
                    Change Photo
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
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-slate-800">
                        <User className="h-4 w-4 text-slate-500" />
                        <span>{profile.name || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex items-center gap-2 text-slate-800">
                      <Mail className="h-4 w-4 text-slate-500" />
                      <span>{profile.email}</span>
                      <span className="text-xs text-slate-500">(cannot be changed)</span>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        placeholder="+91 98765 43210"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-slate-800">
                        <Phone className="h-4 w-4 text-slate-500" />
                        <span>{profile.phone || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    {isEditing ? (
                      <Input
                        id="location"
                        value={profile.location}
                        onChange={(e) => setProfile({...profile, location: e.target.value})}
                        placeholder="Mumbai, Maharashtra"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-slate-800">
                        <MapPin className="h-4 w-4 text-slate-500" />
                        <span>{profile.location || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    {isEditing ? (
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={profile.dateOfBirth}
                        onChange={(e) => setProfile({...profile, dateOfBirth: e.target.value})}
                      />
                    ) : (
                      <div className="text-slate-800">
                        {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-IN') : 'Not provided'}
                      </div>
                    )}
                  </div>

                  {/* Occupation */}
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    {isEditing ? (
                      <Input
                        id="occupation"
                        value={profile.occupation}
                        onChange={(e) => setProfile({...profile, occupation: e.target.value})}
                        placeholder="Software Engineer"
                      />
                    ) : (
                      <div className="text-slate-800">
                        {profile.occupation || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">About Me</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      placeholder="Tell us a bit about yourself..."
                      rows={3}
                    />
                  ) : (
                    <div className="text-slate-800 bg-slate-50 p-3 rounded-lg min-h-[80px]">
                      {profile.bio || 'No bio provided'}
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
            <CardTitle className="text-red-600">Account Actions</CardTitle>
            <CardDescription>
              Manage your account settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline" 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-2"
              >
                Sign Out
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    toast.error('Account deletion feature will be available soon.')
                  }
                }}
                className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
              >
                Delete Account
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

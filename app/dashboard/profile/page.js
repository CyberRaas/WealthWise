'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import OnboardingGuard from '@/components/OnboardingGuard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Settings,
  Bell,
  Shield,
  CreditCard,
  Download,
  Trash2,
  Edit3
} from 'lucide-react'
import toast from 'react-hot-toast'

function ProfileContent() {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: session?.user?.name || 'John Doe',
    email: session?.user?.email || 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    memberSince: 'January 2024',
    accountType: 'Premium'
  })

  const handleSaveProfile = () => {
    setIsEditing(false)
    toast.success('Profile updated successfully!')
  }

  const handleExportData = () => {
    toast.success('Data export initiated. Check your email for download link.')
  }

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.error('Account deletion initiated. You will receive a confirmation email.')
    }
  }

  return (
    <DashboardLayout title="Profile & Settings">
      <div className="space-y-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Manage your personal information and account details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={session?.user?.image} />
                  <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                    {profile.name[0]}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  Change Photo
                </Button>
              </div>

              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Full Name</label>
                    {isEditing ? (
                      <Input 
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                      />
                    ) : (
                      <p className="text-slate-800 font-medium">{profile.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Email Address</label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-500" />
                      <p className="text-slate-800">{profile.email}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Phone Number</label>
                    {isEditing ? (
                      <Input 
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-500" />
                        <p className="text-slate-800">{profile.phone}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Location</label>
                    {isEditing ? (
                      <Input 
                        value={profile.location}
                        onChange={(e) => setProfile({...profile, location: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-500" />
                        <p className="text-slate-800">{profile.location}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile}>Save Changes</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                    </div>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                      <Edit3 className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Account Type</span>
                <Badge className="bg-emerald-100 text-emerald-800">{profile.accountType}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Member Since</span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium">{profile.memberSince}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Data Usage</span>
                <span className="text-sm font-medium">2.3 GB / 5 GB</span>
              </div>

              <div className="pt-2">
                <Button variant="outline" className="w-full">
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Email Notifications</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">SMS Alerts</span>
                <input type="checkbox" className="toggle" />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Monthly Reports</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Budget Alerts</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Security & Privacy
            </CardTitle>
            <CardDescription>
              Manage your account security and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-slate-800">Two-Factor Authentication</h4>
                  <p className="text-sm text-slate-600">Add an extra layer of security to your account</p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>

              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-slate-800">Login Activity</h4>
                  <p className="text-sm text-slate-600">Review recent login attempts</p>
                </div>
                <Button variant="outline" size="sm">View Activity</Button>
              </div>

              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-slate-800">Connected Apps</h4>
                  <p className="text-sm text-slate-600">Manage third-party app connections</p>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Data Management</CardTitle>
            <CardDescription>
              Export your data or delete your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-blue-800">Export Your Data</h4>
                  <p className="text-sm text-blue-600">Download all your financial data</p>
                </div>
                <Button 
                  onClick={handleExportData}
                  variant="outline" 
                  size="sm"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-red-800">Delete Account</h4>
                  <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                </div>
                <Button 
                  onClick={handleDeleteAccount}
                  variant="outline" 
                  size="sm"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
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

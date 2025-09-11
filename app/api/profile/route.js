import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import UserProfile from '@/models/UserProfile'

// GET - Fetch user profile
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await dbConnect()
    
    const userProfile = await UserProfile.findOne({ 
      email: session.user.email 
    })

    if (!userProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: {
        name: userProfile.name || session.user.name,
        email: userProfile.email,
        phone: userProfile.phone || '',
        location: userProfile.city || '',
        bio: userProfile.bio || '',
        dateOfBirth: userProfile.dateOfBirth || '',
        occupation: userProfile.occupation || '',
        image: userProfile.profileImage || session.user.image
      }
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT - Update user profile
export async function PUT(request) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, phone, location, bio, dateOfBirth, occupation, image } = body

    await dbConnect()
    
    // Find and update the user profile
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          name: name || session.user.name,
          phone: phone || '',
          city: location || '',
          bio: bio || '',
          dateOfBirth: dateOfBirth || null,
          occupation: occupation || '',
          profileImage: image || session.user.image,
          updatedAt: new Date()
        }
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true
      }
    )

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        name: updatedProfile.name,
        email: updatedProfile.email,
        phone: updatedProfile.phone || '',
        location: updatedProfile.city || '',
        bio: updatedProfile.bio || '',
        dateOfBirth: updatedProfile.dateOfBirth || '',
        occupation: updatedProfile.occupation || '',
        image: updatedProfile.profileImage
      }
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
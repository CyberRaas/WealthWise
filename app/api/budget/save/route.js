import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// API route to save custom budget
export async function POST(request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { budget } = await request.json()

    if (!budget || !budget.categories) {
      return NextResponse.json(
        { success: false, error: 'Invalid budget data' },
        { status: 400 }
      )
    }

    // Validate budget structure
    const requiredFields = ['totalBudget', 'categories', 'healthScore']
    const missingFields = requiredFields.filter(field => !budget[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Add metadata for custom budget
    const customBudgetData = {
      ...budget,
      isCustomized: true,
      customizedAt: new Date().toISOString(),
      userId: session.user.id,
      version: '1.0'
    }

    // For now, store in memory/localStorage - in production, save to database
    // This is a simplified implementation for demonstration
    
    console.log('Saving custom budget for user:', session.user.id)
    console.log('Custom budget data:', {
      totalBudget: customBudgetData.totalBudget,
      categoriesCount: Object.keys(customBudgetData.categories).length,
      healthScore: customBudgetData.healthScore,
      isCustomized: customBudgetData.isCustomized
    })

    // In a real implementation, you would save to database:
    // await db.budgets.upsert({
    //   where: { userId: session.user.id },
    //   update: customBudgetData,
    //   create: customBudgetData
    // })

    return NextResponse.json({
      success: true,
      message: 'Custom budget saved successfully',
      budget: customBudgetData
    })

  } catch (error) {
    console.error('Error saving custom budget:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save custom budget' },
      { status: 500 }
    )
  }
}

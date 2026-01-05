import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, email, fullName, userType } = await request.json()
    
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      return NextResponse.json({ success: true, profile: existingProfile })
    }

    // Create new profile
    const { data: newProfile, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
        full_name: fullName || email.split('@')[0],
        user_type: userType || 'client',
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating profile:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: newProfile })
  } catch (error) {
    console.error('Error in create-profile API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
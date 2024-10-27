import { NextResponse } from 'next/server'

// This map will store the moderation results temporarily
const moderationResults = new Map<string, { status: string, message: string }>()

export async function POST(request: Request) {

  const data = await request.json()
  
  // Check if this is a webhook from Cloudinary
  if (data.notification_type === 'moderation' || data.notification_type === 'moderation_summary') {
    const { moderation_status, moderation_kind, asset_id } = data

    let status = 'pending'
    let message = ''
    

    if (moderation_status === 'rejected') {
      status = 'rejected'
      if (moderation_kind === 'aws_rek') {
        message = 'Your image was rejected due to unsuitable content'
      } else if (moderation_kind === 'perception_point') {
        message = 'Your image was rejected due to potential malware'
      }
    } else if (moderation_status === 'approved') {
      status = 'approved'
      message = 'Image approved'
    }

    // Store the result
    moderationResults.set(asset_id, { status, message })

    return NextResponse.json({ success: true })
  }

  // If it's not a webhook, it's a request from our frontend
  const { public_id, asset_id } = data


  // Check if we have a moderation result for this asset
  const moderationResult = moderationResults.get(asset_id)

  if (!moderationResult) {
    return NextResponse.json({ status: 'pending', message: 'Moderation in progress' })
  }

  // Clear the result from our temporary storage
  moderationResults.delete(asset_id)

  if (moderationResult.status === 'approved') {

    let poorQuality = false

    if (data.tags && data.tags.includes('poor_quality')) {
      poorQuality = true
    }
 
    return NextResponse.json({ 
      status: 'approved',
      poorQuality: poorQuality, 
      imageUrl: public_id
    })
  } else {
    return NextResponse.json({ 
      status: 'rejected', 
      message: moderationResult.message
    })
  }
}
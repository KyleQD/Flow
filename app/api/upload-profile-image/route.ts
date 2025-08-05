import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest } from '@/lib/auth/api-auth'

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const { user, supabase } = await authenticateApiRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'avatar' or 'header'

    if (!file || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing file or type' },
        { status: 400 }
      )
    }

    console.log('Uploading profile image:', { type, fileName: file.name, size: file.size })

    // Validate file type
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!acceptedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (4MB)
    const maxSize = 4 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 4MB' },
        { status: 400 }
      )
    }

    // Create the storage bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets()
    const profileImagesBucket = buckets?.find(b => b.name === 'profile-images')
    
    if (!profileImagesBucket) {
      console.log('Creating profile-images bucket...')
      const { error: bucketError } = await supabase.storage.createBucket('profile-images', {
        public: true,
        fileSizeLimit: maxSize,
        allowedMimeTypes: acceptedTypes
      })
      
      if (bucketError) {
        console.error('Bucket creation error:', bucketError)
        return NextResponse.json(
          { success: false, error: 'Failed to create storage bucket' },
          { status: 500 }
        )
      }
    }

    // Add header_url column to profiles table if it doesn't exist
    const { error: columnError } = await supabase.rpc('exec_sql', {
      sql_query: `
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'profiles' AND column_name = 'header_url'
            ) THEN
                ALTER TABLE profiles ADD COLUMN header_url TEXT;
                RAISE NOTICE 'Added header_url column to profiles table';
            ELSE
                RAISE NOTICE 'header_url column already exists';
            END IF;
        END $$;
      `
    })

    if (columnError) {
      console.error('Column addition error:', columnError)
      // Try alternative approach - check if column exists first
      const { data: columns, error: checkError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'profiles')
        .eq('column_name', 'header_url')

      if (checkError) {
        console.error('Column check error:', checkError)
      } else if (!columns || columns.length === 0) {
        console.log('header_url column does not exist, will use metadata approach')
      }
    }

    // Generate file path
    const fileExt = file.name.split('.').pop()
    const fileName = `${type}_${user.id}_${Date.now()}.${fileExt}`
    const filePath = `${type}s/${fileName}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload file using server-side Supabase client
    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { success: false, error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath)

    console.log('Upload successful:', publicUrl)

    // Try to update profile with image URL
    let profileUpdateSuccess = false
    
    // First, try updating the specific column
    const updateData = type === 'avatar' 
      ? { avatar_url: publicUrl }
      : { header_url: publicUrl }

    const { error: profileError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)

    if (profileError) {
      console.error('Profile update error:', profileError)
      
      // If header_url column doesn't exist, try using metadata approach
      if (profileError.message.includes('header_url') && type === 'header') {
        console.log('Trying metadata approach for header_url...')
        
        // Get existing profile data
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('metadata')
          .eq('id', user.id)
          .single()

        const existingMetadata = existingProfile?.metadata || {}
        
        // Update metadata with header URL
        const { error: metadataError } = await supabase
          .from('profiles')
          .update({
            metadata: {
              ...existingMetadata,
              header_url: publicUrl
            }
          })
          .eq('id', user.id)

        if (metadataError) {
          console.error('Metadata update error:', metadataError)
          return NextResponse.json(
            { success: false, error: 'Upload successful but failed to update profile metadata' },
            { status: 500 }
          )
        } else {
          profileUpdateSuccess = true
          console.log('Profile updated successfully using metadata approach')
          console.log('Header URL saved to metadata:', publicUrl)
        }
      } else {
        return NextResponse.json(
          { success: false, error: 'Upload successful but failed to update profile' },
          { status: 500 }
        )
      }
    } else {
      profileUpdateSuccess = true
      console.log('Profile updated successfully using direct column approach')
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      message: 'Image uploaded successfully'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
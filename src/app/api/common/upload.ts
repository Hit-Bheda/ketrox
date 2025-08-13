import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string // service role key
)

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `uploads/${fileName}`

    const { error } = await supabase.storage
      .from('my-bucket')
      .upload(filePath, file, {
        contentType: file.type,
      })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    const { data } = supabase.storage
      .from('my-bucket')
      .getPublicUrl(filePath)

    return Response.json({ url: data.publicUrl }, { status: 200 })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

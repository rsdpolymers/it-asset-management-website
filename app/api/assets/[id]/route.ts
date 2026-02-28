import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { assetSchema } from '@/lib/validation'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase()
    const asset = await db
      .collection('assets')
      .findOne({ _id: new ObjectId(params.id) })

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    return NextResponse.json(asset)
  } catch (error) {
    console.error('GET /api/assets/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch asset' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase()
    const body = await request.json()

    // Validate request body
    const validationResult = assetSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      )
    }

    // Validate ID format
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid asset ID' },
        { status: 400 }
      )
    }

    const result = await db
      .collection('assets')
      .findOneAndUpdate(
        { _id: new ObjectId(params.id) },
        {
          $set: {
            ...validationResult.data,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' }
      )

    if (!result.value) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    return NextResponse.json(result.value)
  } catch (error) {
    console.error('PUT /api/assets/[id] error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update asset' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase()
    const result = await db
      .collection('assets')
      .deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/assets/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 }
    )
  }
}

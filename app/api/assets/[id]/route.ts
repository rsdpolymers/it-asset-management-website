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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params   // ✅ FIX HERE

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid asset ID' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // const client = await connectToDatabase()
    const { db } = await connectToDatabase()

    const result = await db.collection('assets').updateOne(
      { _id: new ObjectId(id) },
      { $set: body }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to update asset' },
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

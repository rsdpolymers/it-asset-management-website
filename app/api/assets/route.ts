import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { assetSchema } from '@/lib/validation'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const searchParams = request.nextUrl.searchParams

    const status = searchParams.get('status')
    const deviceType = searchParams.get('deviceType')
    const location = searchParams.get('location')
    const search = searchParams.get('search')

    const filter: any = {}

    if (status) filter.status = status
    if (deviceType) filter.deviceType = deviceType
    if (location) filter.location = location

    if (search) {
      filter.$or = [
        { assetTag: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
      ]
    }

    const assets = await db
      .collection('assets')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(assets)
  } catch (error) {
    console.error('GET /api/assets error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const asset = {
      ...validationResult.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('assets').insertOne(asset)

    return NextResponse.json(
      { _id: result.insertedId, ...asset },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/assets error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create asset' },
      { status: 500 }
    )
  }
}

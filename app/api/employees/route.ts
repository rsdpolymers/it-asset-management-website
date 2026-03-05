import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import jwt from 'jsonwebtoken'

function verifyToken(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  if (!token) return null

  try {
    return jwt.verify(token, process.env.JWT_SECRET!)
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {

  const user = verifyToken(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { db } = await connectToDatabase()

    const employees = await db
      .collection('employees')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(employees)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

// Add Single Employee
export async function POST(request: NextRequest) {

  const user = verifyToken(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { db } = await connectToDatabase()
    const body = await request.json()

    if (Array.isArray(body)) {
      return NextResponse.json(
        { error: "Send one employee at a time" },
        { status: 400 }
      )
    }

    const employee = {
      name: body.name,
      email: body.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('employees').insertOne(employee)

    return NextResponse.json(
      { _id: result.insertedId, ...employee },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/employees error:', error)
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    )
  }
}

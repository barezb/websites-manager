// File: src/app/api/websites/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest, response: NextResponse) {
  try {
    // Ensure user is authenticated
    await requireAuth(request,response)

    // Fetch websites with minimal details
    const websites = await prisma.website.findMany({
      select: {
        id: true,
        name: true,
        url: true,
        technologies: true,
        hostProvider: true,
        status: true,
        category: {
          select: {
            name: true,
            color: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(websites)
  } catch (error) {
    console.error('Failed to fetch websites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch websites' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, response: NextResponse) {
  try {
    // Ensure user is authenticated
    await requireAuth(request,response)

    // Parse request body
    const websiteData = await request.json()

    // Validate input (add more validation as needed)
    if (!websiteData.name || !websiteData.url) {
      return NextResponse.json(
        { error: 'Name and URL are required' }, 
        { status: 400 }
      )
    }

    // Create website
    const newWebsite = await prisma.website.create({
      data: {
        name: websiteData.name,
        url: websiteData.url,
        technologies: websiteData.technologies || [],
        hostProvider: websiteData.hostProvider,
        domainRenewal: websiteData.domainRenewal ? new Date(websiteData.domainRenewal) : undefined,
        hostRenewal: websiteData.hostRenewal ? new Date(websiteData.hostRenewal) : undefined,
        categoryId: websiteData.categoryId,
        clientId: websiteData.clientId,
        loginInfo: websiteData.loginInfo,
        notes: websiteData.notes
      }
    })

    return NextResponse.json(newWebsite, { status: 201 })
  } catch (error) {
    console.error('Failed to create website:', error)
    return NextResponse.json(
      { error: 'Failed to create website' }, 
      { status: 500 }
    )
  }
}
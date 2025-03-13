// File: src/app/api/clients/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/authcopy'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
    try {
        // Ensure user is authenticated
        await requireAuth(request)

        // Fetch clients with website and payment counts
        const clients = await prisma.client.findMany({
            include: {
                _count: {
                    select: {
                        websites: true,
                        payments: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        })

        // Transform the result to include counts
        const clientsWithCounts = clients.map(client => ({
            id: client.id,
            name: client.name,
            email: client.email,
            phone: client.phone,
            websiteCount: client._count.websites,
            paymentCount: client._count.payments,
            notes: client.notes
        }))

        return NextResponse.json(clientsWithCounts)
    } catch (error) {
        console.error('Failed to fetch clients:', error)
        return NextResponse.json(
            { error: 'Failed to fetch clients' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        // Ensure user is authenticated
        await requireAuth(request)

        // Parse request body
        const { name, email, phone, address, notes } = await request.json()

        // Validate input
        if (!name) {
            return NextResponse.json(
                { error: 'Client name is required' },
                { status: 400 }
            )
        }

        // Create client
        const newClient = await prisma.client.create({
            data: {
                name,
                email,
                phone,
                address,
                notes
            }
        })

        return NextResponse.json(newClient, { status: 201 })
    } catch (error) {
        console.error('Failed to create client:', error)
        return NextResponse.json(
            { error: 'Failed to create client' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        // Ensure user is authenticated
        await requireAuth(request)

        // Parse request body
        const { id, name, email, phone, address, notes } = await request.json()

        // Validate input
        if (!id || !name) {
            return NextResponse.json(
                { error: 'Client ID and name are required' },
                { status: 400 }
            )
        }

        // Update client
        const updatedClient = await prisma.client.update({
            where: { id },
            data: {
                name,
                email,
                phone,
                address,
                notes
            }
        })

        return NextResponse.json(updatedClient)
    } catch (error) {
        console.error('Failed to update client:', error)
        return NextResponse.json(
            { error: 'Failed to update client' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        // Ensure user is authenticated
        await requireAuth(request)

        // Get client ID from search params
        const { searchParams } = new URL(request.url)
        const clientId = searchParams.get('id')

        if (!clientId) {
            return NextResponse.json(
                { error: 'Client ID is required' },
                { status: 400 }
            )
        }

        // Check if client has associated websites or payments
        const websiteCount = await prisma.website.count({
            where: { clientId }
        })

        const paymentCount = await prisma.payment.count({
            where: { clientId }
        })

        if (websiteCount > 0 || paymentCount > 0) {
            return NextResponse.json(
                { error: 'Cannot delete client with associated websites or payments' },
                { status: 400 }
            )
        }

        // Delete client
        await prisma.client.delete({
            where: { id: clientId }
        })

        return NextResponse.json({ message: 'Client deleted successfully' })
    } catch (error) {
        console.error('Failed to delete client:', error)
        return NextResponse.json(
            { error: 'Failed to delete client' },
            { status: 500 }
        )
    }
}
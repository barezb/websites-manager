// File: src/app/api/clients/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Ensure user is authenticated
        await requireAuth(request)

        const clientId = params.id

        // Fetch client details with associated websites and payments
        const client = await prisma.client.findUnique({
            where: { id: clientId },
            include: {
                websites: {
                    select: {
                        id: true,
                        name: true,
                        url: true,
                        technologies: true,
                        status: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                payments: {
                    select: {
                        id: true,
                        amount: true,
                        date: true,
                        status: true,
                        invoiceNumber: true
                    },
                    orderBy: {
                        date: 'desc'
                    }
                }
            }
        })

        if (!client) {
            return NextResponse.json(
                { error: 'Client not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(client)
    } catch (error) {
        console.error('Failed to fetch client details:', error)
        return NextResponse.json(
            { error: 'Failed to fetch client details' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Ensure user is authenticated
        await requireAuth(request)

        const clientId = params.id
        const { name, email, phone, address, notes } = await request.json()

        // Validate input
        if (!name) {
            return NextResponse.json(
                { error: 'Client name is required' },
                { status: 400 }
            )
        }

        // Update client
        const updatedClient = await prisma.client.update({
            where: { id: clientId },
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

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Ensure user is authenticated
        await requireAuth(request)

        const clientId = params.id

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
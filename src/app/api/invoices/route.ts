// File: src/app/api/invoices/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, PaymentStatus } from '@prisma/client'
import { requireAuth } from '@/lib/auth'
import { generateInvoice } from '@/lib/invoice-generatos'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
    try {
        // Ensure user is authenticated
        await requireAuth(request)

        // Get query parameters
        const { searchParams } = new URL(request.url)
        const clientId = searchParams.get('clientId')
        const status = searchParams.get('status') as PaymentStatus | null

        // Build filter conditions
        const whereCondition: any = {}
        if (clientId) whereCondition.clientId = clientId
        if (status) whereCondition.status = status

        // Fetch invoices with client details
        const invoices = await prisma.payment.findMany({
            where: whereCondition,
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        })

        return NextResponse.json(invoices)
    } catch (error) {
        console.error('Failed to fetch invoices:', error)
        return NextResponse.json(
            { error: 'Failed to fetch invoices' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        // Ensure user is authenticated
        await requireAuth(request)

        // Parse request body
        const {
            clientId,
            amount,
            description,
            date,
            status = 'PENDING'
        } = await request.json()

        // Validate input
        if (!clientId || !amount) {
            return NextResponse.json(
                { error: 'Client ID and amount are required' },
                { status: 400 }
            )
        }

        // Verify client exists
        const client = await prisma.client.findUnique({
            where: { id: clientId }
        })

        if (!client) {
            return NextResponse.json(
                { error: 'Client not found' },
                { status: 404 }
            )
        }

        // Generate invoice
        const invoiceResult = await generateInvoice({
            clientId,
            amount,
            description
        })

        // Create payment record
        const payment = await prisma.payment.create({
            data: {
                clientId,
                amount,
                date: date ? new Date(date) : new Date(),
                status: status as PaymentStatus,
                description,
                invoiceNumber: invoiceResult.invoiceNumber
            }
        })

        return NextResponse.json({
            payment,
            invoicePath: invoiceResult.invoicePath
        }, { status: 201 })
    } catch (error) {
        console.error('Failed to create invoice:', error)
        return NextResponse.json(
            { error: 'Failed to create invoice' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        // Ensure user is authenticated
        await requireAuth(request)

        // Parse request body
        const {
            id,
            amount,
            description,
            date,
            status
        } = await request.json()

        // Validate input
        if (!id) {
            return NextResponse.json(
                { error: 'Invoice ID is required' },
                { status: 400 }
            )
        }

        // Update invoice/payment
        const updatedPayment = await prisma.payment.update({
            where: { id },
            data: {
                ...(amount !== undefined && { amount }),
                ...(description !== undefined && { description }),
                ...(date !== undefined && { date: new Date(date) }),
                ...(status !== undefined && { status })
            }
        })

        return NextResponse.json(updatedPayment)
    } catch (error) {
        console.error('Failed to update invoice:', error)
        return NextResponse.json(
            { error: 'Failed to update invoice' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        // Ensure user is authenticated
        await requireAuth(request)

        // Get invoice ID from search params
        const { searchParams } = new URL(request.url)
        const invoiceId = searchParams.get('id')

        if (!invoiceId) {
            return NextResponse.json(
                { error: 'Invoice ID is required' },
                { status: 400 }
            )
        }

        // Delete invoice
        await prisma.payment.delete({
            where: { id: invoiceId }
        })

        return NextResponse.json({ message: 'Invoice deleted successfully' })
    } catch (error) {
        console.error('Failed to delete invoice:', error)
        return NextResponse.json(
            { error: 'Failed to delete invoice' },
            { status: 500 }
        )
    }
}
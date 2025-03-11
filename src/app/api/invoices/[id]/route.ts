// File: src/app/api/invoices/[id]/route.ts
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

        const invoiceId = params.id

        // Fetch invoice details with client information
        const invoice = await prisma.payment.findUnique({
            where: { id: invoiceId },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        address: true
                    }
                }
            }
        })

        if (!invoice) {
            return NextResponse.json(
                { error: 'Invoice not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(invoice)
    } catch (error) {
        console.error('Failed to fetch invoice details:', error)
        return NextResponse.json(
            { error: 'Failed to fetch invoice details' },
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

        const invoiceId = params.id
        const {
            amount,
            description,
            date,
            status,
            clientId
        } = await request.json()

        // Validate input
        if (!amount || !date || !status) {
            return NextResponse.json(
                { error: 'Amount, date, and status are required' },
                { status: 400 }
            )
        }

        // Update invoice
        const updatedInvoice = await prisma.payment.update({
            where: { id: invoiceId },
            data: {
                amount: parseFloat(amount),
                description,
                date: new Date(date),
                status,
                ...(clientId && { clientId })
            }
        })

        return NextResponse.json(updatedInvoice)
    } catch (error) {
        console.error('Failed to update invoice:', error)
        return NextResponse.json(
            { error: 'Failed to update invoice' },
            { status: 500 }
        )
    }
}
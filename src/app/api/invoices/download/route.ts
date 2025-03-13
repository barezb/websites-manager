// File: src/app/api/invoices/download/route.ts
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { requireAuth } from '@/lib/authcopy'

export async function GET(request: NextRequest) {
    try {
        // Ensure user is authenticated
        await requireAuth(request)

        // Get invoice number from query params
        const { searchParams } = new URL(request.url)
        const invoiceNumber = searchParams.get('number')

        if (!invoiceNumber) {
            return NextResponse.json(
                { error: 'Invoice number is required' },
                { status: 400 }
            )
        }

        // Construct invoice file path
        const invoicePath = path.join(
            process.cwd(),
            'public',
            'invoices',
            `${invoiceNumber}.pdf`
        )

        // Check if file exists
        if (!fs.existsSync(invoicePath)) {
            return NextResponse.json(
                { error: 'Invoice file not found' },
                { status: 404 }
            )
        }

        // Read the file
        const invoiceBuffer = fs.readFileSync(invoicePath)

        // Create response with PDF file
        return new NextResponse(invoiceBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${invoiceNumber}.pdf"`
            }
        })
    } catch (error) {
        console.error('Failed to download invoice:', error)
        return NextResponse.json(
            { error: 'Failed to download invoice' },
            { status: 500 }
        )
    }
}
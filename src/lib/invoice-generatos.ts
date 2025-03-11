import { PrismaClient } from '@prisma/client'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface InvoiceDetails {
    clientId: string
    amount: number
    description?: string
    logoPath?: string
}

export async function generateInvoice(details: InvoiceDetails) {
    // Fetch client details
    const client = await prisma.client.findUnique({
        where: { id: details.clientId }
    })

    if (!client) {
        throw new Error('Client not found')
    }

    // Generate unique invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create PDF invoice
    const doc = new PDFDocument()
    const invoicePath = path.join(process.cwd(), 'public', 'invoices', `${invoiceNumber}.pdf`)

    // Ensure directory exists
    fs.mkdirSync(path.dirname(invoicePath), { recursive: true })

    const stream = fs.createWriteStream(invoicePath)
    doc.pipe(stream)

    // Invoice Design
    doc.fontSize(25).text('Invoice', 50, 50)

    // Company Logo (if provided)
    if (details.logoPath && fs.existsSync(details.logoPath)) {
        doc.image(details.logoPath, 400, 50, { width: 100 })
    }

    // Client Details
    doc.fontSize(10)
        .text(`Client: ${client.name}`, 50, 100)
        .text(`Email: ${client.email || 'N/A'}`, 50, 115)

    // Invoice Details
    doc.text(`Invoice Number: ${invoiceNumber}`, 50, 150)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, 165)

    // Line Items
    doc.fontSize(12)
        .text('Description', 50, 200)
        .text('Amount', 400, 200)

    doc.fontSize(10)
        .text(details.description || 'Services Rendered', 50, 220)
        .text(`$${details.amount.toFixed(2)}`, 400, 220)

    // Total
    doc.fontSize(12)
        .text(`Total: $${details.amount.toFixed(2)}`, 400, 250)

    // Finalize PDF
    doc.end()

    // Create payment record
    const payment = await prisma.payment.create({
        data: {
            clientId: client.id,
            amount: details.amount,
            invoiceNumber: invoiceNumber,
            description: details.description,
            status: 'PENDING',
            date: new Date()
        }
    })

    return {
        invoicePath,
        invoiceNumber,
        paymentId: payment.id
    }
}

export async function getClientInvoices(clientId: string) {
    return await prisma.payment.findMany({
        where: { clientId },
        orderBy: { createdAt: 'desc' }
    })
}

export async function updatePaymentStatus(paymentId: string, status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED') {
    return await prisma.payment.update({
        where: { id: paymentId },
        data: { status }
    })
}
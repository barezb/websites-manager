// File: src/app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/authcopy'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
    try {
        // Ensure user is authenticated
        await requireAuth(request)

        // Fetch categories with website count
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { websites: true }
                }
            },
            orderBy: {
                name: 'asc'
            }
        })

        // Transform the result to include website count
        const categoriesWithCount = categories.map(category => ({
            id: category.id,
            name: category.name,
            color: category.color,
            websiteCount: category._count.websites
        }))

        return NextResponse.json(categoriesWithCount)
    } catch (error) {
        console.error('Failed to fetch categories:', error)
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        // Ensure user is authenticated
        await requireAuth(request)

        // Parse request body
        const { name, color } = await request.json()

        // Validate input
        if (!name) {
            return NextResponse.json(
                { error: 'Category name is required' },
                { status: 400 }
            )
        }

        // Create category
        const newCategory = await prisma.category.create({
            data: {
                name,
                color
            }
        })

        return NextResponse.json(newCategory, { status: 201 })
    } catch (error) {
        console.error('Failed to create category:', error)
        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        // Ensure user is authenticated
        await requireAuth(request)

        // Parse request body
        const { id, name, color } = await request.json()

        // Validate input
        if (!id || !name) {
            return NextResponse.json(
                { error: 'Category ID and name are required' },
                { status: 400 }
            )
        }

        // Update category
        const updatedCategory = await prisma.category.update({
            where: { id },
            data: {
                name,
                color
            }
        })

        return NextResponse.json(updatedCategory)
    } catch (error) {
        console.error('Failed to update category:', error)
        return NextResponse.json(
            { error: 'Failed to update category' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        // Ensure user is authenticated
        await requireAuth(request)

        // Get category ID from search params
        const { searchParams } = new URL(request.url)
        const categoryId = searchParams.get('id')

        if (!categoryId) {
            return NextResponse.json(
                { error: 'Category ID is required' },
                { status: 400 }
            )
        }

        // Check if category has associated websites
        const websiteCount = await prisma.website.count({
            where: { categoryId }
        })

        if (websiteCount > 0) {
            return NextResponse.json(
                { error: 'Cannot delete category with associated websites' },
                { status: 400 }
            )
        }

        // Delete category
        await prisma.category.delete({
            where: { id: categoryId }
        })

        return NextResponse.json({ message: 'Category deleted successfully' })
    } catch (error) {
        console.error('Failed to delete category:', error)
        return NextResponse.json(
            { error: 'Failed to delete category' },
            { status: 500 }
        )
    }
}
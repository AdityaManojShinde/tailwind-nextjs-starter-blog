import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import jwt from 'jsonwebtoken'
import matter from 'gray-matter'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'
const BLOG_DIR = path.join(process.cwd(), 'data', 'blog')

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided')
  }

  const token = authHeader.substring(7)
  jwt.verify(token, JWT_SECRET)
}

export async function GET(request: NextRequest) {
  try {
    verifyToken(request)

    // Ensure blog directory exists
    try {
      await fs.access(BLOG_DIR)
    } catch {
      await fs.mkdir(BLOG_DIR, { recursive: true })
      return NextResponse.json({ tags: [] })
    }

    const files = await fs.readdir(BLOG_DIR)
    const mdxFiles = files.filter((file) => file.endsWith('.mdx') || file.endsWith('.md'))

    const tagCount: Record<string, number> = {}

    await Promise.all(
      mdxFiles.map(async (file) => {
        const filePath = path.join(BLOG_DIR, file)
        const content = await fs.readFile(filePath, 'utf8')
        const { data } = matter(content)

        if (data.tags && Array.isArray(data.tags)) {
          data.tags.forEach((tag: string) => {
            tagCount[tag] = (tagCount[tag] || 0) + 1
          })
        }
      })
    )

    const tags = Object.entries(tagCount)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json({ tags })
  } catch (error) {
    console.error('Error fetching tags:', error)
    if (error instanceof Error && error.message === 'No token provided') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    verifyToken(request)

    const { name } = await request.json()

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 })
    }

    const tagName = name.trim()
    if (!tagName) {
      return NextResponse.json({ error: 'Tag name cannot be empty' }, { status: 400 })
    }

    // Check if tag already exists by reading all posts
    try {
      await fs.access(BLOG_DIR)
    } catch {
      await fs.mkdir(BLOG_DIR, { recursive: true })
    }

    const files = await fs.readdir(BLOG_DIR)
    const mdxFiles = files.filter((file) => file.endsWith('.mdx') || file.endsWith('.md'))

    let tagExists = false
    for (const file of mdxFiles) {
      const filePath = path.join(BLOG_DIR, file)
      const content = await fs.readFile(filePath, 'utf8')
      const { data } = matter(content)

      if (data.tags && Array.isArray(data.tags) && data.tags.includes(tagName)) {
        tagExists = true
        break
      }
    }

    if (tagExists) {
      return NextResponse.json({ error: 'Tag already exists' }, { status: 409 })
    }

    // For now, we'll just return success. In a real implementation, you might want to
    // create a placeholder post or maintain a separate tags file
    return NextResponse.json({ success: true, message: 'Tag will be available when used in posts' })
  } catch (error) {
    console.error('Error creating tag:', error)
    if (error instanceof Error && error.message === 'No token provided') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 })
  }
}

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

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    verifyToken(request)

    const { slug } = await params
    const filePath = path.join(BLOG_DIR, `${slug}.mdx`)

    // Check if file exists
    try {
      await fs.access(filePath)
    } catch {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const fileContent = await fs.readFile(filePath, 'utf8')
    const { content, data } = matter(fileContent)

    return NextResponse.json({
      content,
      headerImage: data.headerImage || '',
      headerImageAlt: data.headerImageAlt || '',
    })
  } catch (error) {
    console.error('Error fetching post content:', error)
    if (error instanceof Error && error.message === 'No token provided') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch post content' }, { status: 500 })
  }
}

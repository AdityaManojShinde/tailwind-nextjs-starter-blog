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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    verifyToken(request)

    const {
      title,
      slug: newSlug,
      date,
      summary,
      tags,
      draft,
      content,
      headerImage,
      headerImageAlt,
    } = await request.json()
    const { slug: currentSlug } = await params

    if (!title || !newSlug || !content) {
      return NextResponse.json({ error: 'Title, slug, and content are required' }, { status: 400 })
    }

    const currentFilePath = path.join(BLOG_DIR, `${currentSlug}.mdx`)
    const newFilePath = path.join(BLOG_DIR, `${newSlug}.mdx`)

    // Check if current file exists
    try {
      await fs.access(currentFilePath)
    } catch {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // If slug changed, check if new slug already exists
    if (currentSlug !== newSlug) {
      try {
        await fs.access(newFilePath)
        return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 })
      } catch {
        // File doesn't exist, which is what we want
      }
    }

    // Create frontmatter
    const frontmatter = {
      title,
      date: new Date(date).toISOString(),
      ...(summary && { summary }),
      ...(tags && tags.length > 0 && { tags }),
      ...(headerImage && { headerImage }),
      ...(headerImageAlt && { headerImageAlt }),
      ...(draft && { draft }),
    }

    // Create the full content with frontmatter
    const fullContent = matter.stringify(content, frontmatter)

    // Write to new file
    await fs.writeFile(newFilePath, fullContent, 'utf8')

    // If slug changed, delete old file
    if (currentSlug !== newSlug) {
      await fs.unlink(currentFilePath)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating post:', error)
    if (error instanceof Error && error.message === 'No token provided') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
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

    await fs.unlink(filePath)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    if (error instanceof Error && error.message === 'No token provided') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}

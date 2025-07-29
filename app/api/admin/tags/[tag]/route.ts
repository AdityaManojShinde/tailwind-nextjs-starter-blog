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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tag: string }> }
) {
  try {
    verifyToken(request)

    const { tag } = await params
    const tagToDelete = decodeURIComponent(tag)

    if (!tagToDelete) {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 })
    }

    // Ensure blog directory exists
    try {
      await fs.access(BLOG_DIR)
    } catch {
      return NextResponse.json({ error: 'No blog posts found' }, { status: 404 })
    }

    const files = await fs.readdir(BLOG_DIR)
    const mdxFiles = files.filter((file) => file.endsWith('.mdx') || file.endsWith('.md'))

    let postsUpdated = 0

    // Remove the tag from all posts that have it
    await Promise.all(
      mdxFiles.map(async (file) => {
        const filePath = path.join(BLOG_DIR, file)
        const content = await fs.readFile(filePath, 'utf8')
        const { data, content: postContent } = matter(content)

        if (data.tags && Array.isArray(data.tags) && data.tags.includes(tagToDelete)) {
          // Remove the tag from the array
          data.tags = data.tags.filter((tag: string) => tag !== tagToDelete)

          // If tags array is empty, remove the tags field entirely
          if (data.tags.length === 0) {
            delete data.tags
          }

          // Write the updated content back to the file
          const updatedContent = matter.stringify(postContent, data)
          await fs.writeFile(filePath, updatedContent, 'utf8')
          postsUpdated++
        }
      })
    )

    if (postsUpdated === 0) {
      return NextResponse.json({ error: 'Tag not found in any posts' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `Tag "${tagToDelete}" removed from ${postsUpdated} post${postsUpdated !== 1 ? 's' : ''}`,
    })
  } catch (error) {
    console.error('Error deleting tag:', error)
    if (error instanceof Error && error.message === 'No token provided') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 })
  }
}

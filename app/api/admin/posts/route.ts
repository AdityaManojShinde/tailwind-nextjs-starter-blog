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

export async function GET() {
  try {
    // Ensure blog directory exists
    try {
      await fs.access(BLOG_DIR)
    } catch {
      await fs.mkdir(BLOG_DIR, { recursive: true })
      return NextResponse.json({ posts: [] })
    }

    const files = await fs.readdir(BLOG_DIR)
    const mdxFiles = files.filter((file) => file.endsWith('.mdx') || file.endsWith('.md'))

    const posts = await Promise.all(
      mdxFiles.map(async (file) => {
        const filePath = path.join(BLOG_DIR, file)
        const content = await fs.readFile(filePath, 'utf8')
        const { data } = matter(content)

        return {
          slug: file.replace(/\.(mdx?|md)$/, ''),
          title: data.title || 'Untitled',
          date: data.date || new Date().toISOString(),
          summary: data.summary,
          tags: data.tags || [],
          draft: data.draft || false,
          headerImage: data.headerImage,
        }
      })
    )

    // Sort by date (newest first)
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    verifyToken(request)

    const { title, slug, date, summary, tags, draft, content, headerImage, headerImageAlt } =
      await request.json()

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Title, slug, and content are required' }, { status: 400 })
    }

    // Ensure blog directory exists
    try {
      await fs.access(BLOG_DIR)
    } catch {
      await fs.mkdir(BLOG_DIR, { recursive: true })
    }

    const fileName = `${slug}.mdx`
    const filePath = path.join(BLOG_DIR, fileName)

    // Check if file already exists
    try {
      await fs.access(filePath)
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 })
    } catch {
      // File doesn't exist, which is what we want
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

    await fs.writeFile(filePath, fullContent, 'utf8')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating post:', error)
    if (error instanceof Error && error.message === 'No token provided') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}

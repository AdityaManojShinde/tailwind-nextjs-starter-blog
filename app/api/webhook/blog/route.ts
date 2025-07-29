import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import crypto from 'crypto'

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret-change-this'
const BLOG_DIR = path.join(process.cwd(), 'data', 'blog')

function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!signature) return false

  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')

  const providedSignature = signature.replace('sha256=', '')

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(providedSignature, 'hex')
  )
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-webhook-signature') || ''

    // Verify webhook signature for security
    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
    }

    const data = JSON.parse(body)
    const {
      title,
      content,
      summary,
      tags = [],
      draft = false,
      headerImage,
      headerImageAlt,
      slug: customSlug,
      date,
    } = data

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    // Generate slug from title if not provided
    const slug = customSlug || generateSlug(title)

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
      return NextResponse.json(
        { error: `Post with slug "${slug}" already exists` },
        { status: 409 }
      )
    } catch {
      // File doesn't exist, which is what we want
    }

    // Create frontmatter
    const frontmatter = {
      title,
      date: date || new Date().toISOString(),
      ...(summary && { summary }),
      ...(tags && tags.length > 0 && { tags }),
      ...(headerImage && { headerImage }),
      ...(headerImageAlt && { headerImageAlt }),
      ...(draft && { draft }),
    }

    // Create the full content with frontmatter
    const fullContent = matter.stringify(content, frontmatter)

    // Write the file
    await fs.writeFile(filePath, fullContent, 'utf8')

    return NextResponse.json({
      success: true,
      message: 'Blog post created successfully',
      slug,
      fileName,
      url: `/blog/${slug}`,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-webhook-signature') || ''

    // Verify webhook signature for security
    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
    }

    const data = JSON.parse(body)
    const {
      slug,
      title,
      content,
      summary,
      tags = [],
      draft = false,
      headerImage,
      headerImageAlt,
      date,
    } = data

    if (!slug || !title || !content) {
      return NextResponse.json({ error: 'Slug, title and content are required' }, { status: 400 })
    }

    const fileName = `${slug}.mdx`
    const filePath = path.join(BLOG_DIR, fileName)

    // Check if file exists
    try {
      await fs.access(filePath)
    } catch {
      return NextResponse.json({ error: `Post with slug "${slug}" not found` }, { status: 404 })
    }

    // Create frontmatter
    const frontmatter = {
      title,
      date: date || new Date().toISOString(),
      ...(summary && { summary }),
      ...(tags && tags.length > 0 && { tags }),
      ...(headerImage && { headerImage }),
      ...(headerImageAlt && { headerImageAlt }),
      ...(draft && { draft }),
    }

    // Create the full content with frontmatter
    const fullContent = matter.stringify(content, frontmatter)

    // Write the file
    await fs.writeFile(filePath, fullContent, 'utf8')

    return NextResponse.json({
      success: true,
      message: 'Blog post updated successfully',
      slug,
      fileName,
      url: `/blog/${slug}`,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-webhook-signature') || ''

    // Verify webhook signature for security
    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
    }

    const data = JSON.parse(body)
    const { slug } = data

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const fileName = `${slug}.mdx`
    const filePath = path.join(BLOG_DIR, fileName)

    // Check if file exists
    try {
      await fs.access(filePath)
    } catch {
      return NextResponse.json({ error: `Post with slug "${slug}" not found` }, { status: 404 })
    }

    // Delete the file
    await fs.unlink(filePath)

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully',
      slug,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 })
  }
}

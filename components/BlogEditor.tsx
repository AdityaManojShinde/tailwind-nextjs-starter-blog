'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface BlogPost {
  slug: string
  title: string
  date: string
  summary?: string
  tags?: string[]
  draft?: boolean
}

interface BlogEditorProps {
  post: BlogPost | null
  onClose: () => void
}

export default function BlogEditor({ post, onClose }: BlogEditorProps) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    date: new Date().toISOString().split('T')[0],
    summary: '',
    tags: '',
    draft: false,
    content: '',
    headerImage: '',
    headerImageAlt: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imagePreview, setImagePreview] = useState('')

  useEffect(() => {
    if (post) {
      // Load existing post data
      loadPostContent(post.slug)
      setFormData({
        title: post.title,
        slug: post.slug,
        date: post.date.split('T')[0],
        summary: post.summary || '',
        tags: post.tags?.join(', ') || '',
        draft: post.draft || false,
        content: '',
        headerImage: '',
        headerImageAlt: '',
      })
    }
  }, [post])

  const loadPostContent = async (slug: string) => {
    try {
      const response = await fetch(`/api/admin/posts/${slug}/content`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin-token')}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setFormData((prev) => ({
          ...prev,
          content: data.content,
          headerImage: data.headerImage || '',
          headerImageAlt: data.headerImageAlt || '',
        }))
        setImagePreview(data.headerImage || '')
      }
    } catch (error) {
      console.error('Failed to load post content:', error)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: post ? prev.slug : generateSlug(title),
    }))
  }

  const handleImageUrlChange = (url: string) => {
    setFormData((prev) => ({ ...prev, headerImage: url }))
    setImagePreview(url)
  }

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, headerImage: '', headerImageAlt: '' }))
    setImagePreview('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const postData = {
        title: formData.title,
        slug: formData.slug,
        date: formData.date,
        summary: formData.summary,
        tags: tagsArray,
        draft: formData.draft,
        content: formData.content,
        headerImage: formData.headerImage,
        headerImageAlt: formData.headerImageAlt,
      }

      const url = post ? `/api/admin/posts/${post.slug}` : '/api/admin/posts'

      const method = post ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin-token')}`,
        },
        body: JSON.stringify(postData),
      })

      if (response.ok) {
        onClose()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save post')
      }
    } catch (error) {
      setError('Failed to save post')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
            {post ? 'Edit Post' : 'Create New Post'}
          </h1>
          <button
            onClick={onClose}
            className="self-start p-2 text-gray-400 hover:text-gray-600 sm:self-auto dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg bg-white p-4 shadow sm:p-6 dark:bg-gray-800">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Title */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  className="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Slug *
                </label>
                <input
                  type="text"
                  required
                  className="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  className="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>

              {/* Summary */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Summary
                </label>
                <textarea
                  rows={3}
                  className="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={formData.summary}
                  onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                />
              </div>

              {/* Header Image */}
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Header Image
                </label>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative mb-4">
                    <img
                      src={imagePreview}
                      alt="Header preview"
                      className="h-48 w-full max-w-md rounded-lg border border-gray-300 object-cover dark:border-gray-600"
                      onError={() => {
                        setImagePreview('')
                        setError('Failed to load image')
                      }}
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Image URL Input */}
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                      Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      value={formData.headerImage}
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Enter a direct link to an image (JPG, PNG, GIF, WebP)
                    </p>
                  </div>

                  {/* Alt Text */}
                  {formData.headerImage && (
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                        Alt text (for accessibility)
                      </label>
                      <input
                        type="text"
                        placeholder="Describe the image..."
                        className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        value={formData.headerImageAlt}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, headerImageAlt: e.target.value }))
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  className="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={formData.tags}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                  placeholder="nextjs, react, tailwind"
                />
              </div>

              {/* Draft */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-gray-300"
                  checked={formData.draft}
                  onChange={(e) => setFormData((prev) => ({ ...prev, draft: e.target.checked }))}
                />
                <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Save as draft
                </label>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="rounded-lg bg-white p-4 shadow sm:p-6 dark:bg-gray-800">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Content (Markdown) *
            </label>
            <textarea
              required
              rows={25}
              className="focus:border-primary-500 focus:ring-primary-500 block w-full resize-y rounded-md border border-gray-300 px-3 py-2 font-mono text-sm text-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Write your blog post content in Markdown..."
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              You can use Markdown syntax. The editor will automatically resize as you type.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col justify-end gap-3 sm:flex-row sm:gap-4">
            <button
              type="button"
              onClick={onClose}
              className="order-2 rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:order-1 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 order-1 rounded-md px-6 py-2 text-sm font-medium text-white disabled:opacity-50 sm:order-2"
            >
              {loading ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

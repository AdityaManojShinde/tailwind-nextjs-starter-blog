'use client'

import { useState, useEffect } from 'react'
import { PencilIcon, TrashIcon, PlusIcon, TagIcon } from '@heroicons/react/24/outline'
import BlogEditor from './BlogEditor'
import TagManager from './TagManager'

interface BlogPost {
  slug: string
  title: string
  date: string
  summary?: string
  tags?: string[]
  draft?: boolean
  headerImage?: string
}

interface AdminDashboardProps {
  onLogout: () => void
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [showTagManager, setShowTagManager] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/admin/posts')
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    }
    setLoading(false)
  }

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const response = await fetch(`/api/admin/posts/${slug}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin-token')}`,
        },
      })

      if (response.ok) {
        setPosts(posts.filter((post) => post.slug !== slug))
      } else {
        alert('Failed to delete post')
      }
    } catch (error) {
      alert('Failed to delete post')
    }
  }

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post)
    setShowEditor(true)
  }

  const handleCreate = () => {
    setEditingPost(null)
    setShowEditor(true)
  }

  const handleEditorClose = () => {
    setShowEditor(false)
    setEditingPost(null)
    fetchPosts() // Refresh the posts list
  }

  const handleTagManagerClose = () => {
    setShowTagManager(false)
  }

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (showEditor) {
    return <BlogEditor post={editingPost} onClose={handleEditorClose} />
  }

  if (showTagManager) {
    return <TagManager onClose={handleTagManagerClose} />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                Admin Dashboard
              </h1>
              <p className="mt-2 text-sm text-gray-600 sm:text-base dark:text-gray-400">
                Manage your blog posts and tags
              </p>
            </div>
            <button
              onClick={onLogout}
              className="self-start rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 sm:self-auto"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6 space-y-4 sm:space-y-0">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-lg flex-1">
              <input
                type="text"
                placeholder="Search posts..."
                className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setShowTagManager(true)}
                className="inline-flex items-center justify-center rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
              >
                <TagIcon className="mr-2 h-4 w-4" />
                Manage Tags
              </button>
              <button
                onClick={handleCreate}
                className="bg-primary-600 hover:bg-primary-700 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                New Post
              </button>
            </div>
          </div>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="py-8 text-center">
            <div className="text-lg text-gray-600 dark:text-gray-400">Loading posts...</div>
          </div>
        ) : (
          <div className="overflow-hidden bg-white shadow sm:rounded-md dark:bg-gray-800">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPosts.length === 0 ? (
                <li className="px-4 py-8 text-center text-gray-500 sm:px-6 dark:text-gray-400">
                  {searchTerm ? 'No posts found matching your search.' : 'No posts found.'}
                </li>
              ) : (
                filteredPosts.map((post) => (
                  <li key={post.slug} className="px-4 py-4 sm:px-6">
                    <div className="flex flex-col gap-4 sm:flex-row">
                      {/* Header Image */}
                      {post.headerImage && (
                        <div className="flex-shrink-0">
                          <img
                            src={post.headerImage}
                            alt={post.title}
                            className="h-32 w-full rounded-lg border border-gray-200 object-cover sm:h-16 sm:w-24 dark:border-gray-700"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                            <h3 className="text-base font-medium break-words text-gray-900 sm:text-lg dark:text-white">
                              {post.title}
                            </h3>
                            {post.draft && (
                              <span className="inline-flex items-center self-start rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                Draft
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex flex-col gap-2 text-xs text-gray-500 sm:flex-row sm:items-center sm:gap-4 sm:text-sm dark:text-gray-400">
                            <span>{new Date(post.date).toLocaleDateString()}</span>
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                <span className="hidden sm:inline">Tags:</span>
                                {post.tags.map((tag, index) => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {post.summary && (
                            <p className="mt-2 line-clamp-2 text-sm break-words text-gray-600 dark:text-gray-300">
                              {post.summary}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <button
                            onClick={() => handleEdit(post)}
                            className="hover:text-primary-600 dark:hover:text-primary-400 p-2 text-gray-400"
                            title="Edit post"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(post.slug)}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            title="Delete post"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

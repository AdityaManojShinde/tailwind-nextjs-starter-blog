'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, PlusIcon, TagIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Tag {
  name: string
  count: number
}

interface TagManagerProps {
  onClose: () => void
}

export default function TagManager({ onClose }: TagManagerProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [newTag, setNewTag] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/admin/tags', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin-token')}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setTags(data.tags)
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error)
      setError('Failed to load tags')
    }
    setLoading(false)
  }

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTag.trim()) return

    try {
      const response = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin-token')}`,
        },
        body: JSON.stringify({ name: newTag.trim() }),
      })

      if (response.ok) {
        setNewTag('')
        fetchTags() // Refresh the tags list
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to add tag')
      }
    } catch (error) {
      setError('Failed to add tag')
    }
  }

  const handleDeleteTag = async (tagName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the tag "${tagName}"? This will remove it from all posts.`
      )
    ) {
      return
    }

    try {
      const response = await fetch(`/api/admin/tags/${encodeURIComponent(tagName)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin-token')}`,
        },
      })

      if (response.ok) {
        fetchTags() // Refresh the tags list
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete tag')
      }
    } catch (error) {
      setError('Failed to delete tag')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
              Tag Management
            </h1>
            <p className="mt-2 text-sm text-gray-600 sm:text-base dark:text-gray-400">
              Add, remove, and manage your blog tags
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
          </div>
        )}

        {/* Add New Tag */}
        <div className="mb-8 rounded-lg bg-white p-4 shadow sm:p-6 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Add New Tag</h2>
          <form onSubmit={handleAddTag} className="flex flex-col gap-4 sm:flex-row">
            <input
              type="text"
              placeholder="Enter tag name..."
              className="focus:border-primary-500 focus:ring-primary-500 flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
            />
            <button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap text-white"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Tag
            </button>
          </form>
        </div>

        {/* Tags List */}
        <div className="rounded-lg bg-white shadow dark:bg-gray-800">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
              Existing Tags ({tags.length})
            </h2>

            {loading ? (
              <div className="py-8 text-center">
                <div className="text-gray-600 dark:text-gray-400">Loading tags...</div>
              </div>
            ) : tags.length === 0 ? (
              <div className="py-8 text-center">
                <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tags</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get started by creating a new tag.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tags.map((tag) => (
                  <div
                    key={tag.name}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                  >
                    <div className="flex min-w-0 flex-1 items-center space-x-3">
                      <TagIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {tag.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {tag.count} post{tag.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTag(tag.name)}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      title="Delete tag"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

#!/usr/bin/env node

const crypto = require('crypto')
const https = require('https')

// Configuration
const WEBHOOK_URL = 'http://localhost:3000/api/webhook/blog' // Change to your domain in production
const WEBHOOK_SECRET = 'your-super-secure-webhook-secret-change-this-in-production' // Should match your .env.local

function generateSignature(payload, secret) {
  return 'sha256=' + crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

async function sendWebhook(method, data) {
  const payload = JSON.stringify(data)
  const signature = generateSignature(payload, WEBHOOK_SECRET)

  const url = new URL(WEBHOOK_URL)

  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname,
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature,
      'Content-Length': Buffer.byteLength(payload),
    },
  }

  return new Promise((resolve, reject) => {
    const req = (url.protocol === 'https:' ? https : require('http')).request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        try {
          const response = JSON.parse(data)
          resolve({ status: res.statusCode, data: response })
        } catch (e) {
          resolve({ status: res.statusCode, data: data })
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.write(payload)
    req.end()
  })
}

async function testCreatePost() {
  console.log('🚀 Testing webhook: Create Post')

  const postData = {
    title: 'Test Webhook Post',
    content: `# Test Webhook Post

This is a test post created via webhook!

## Features Tested

- Remote post creation
- Markdown content
- Tags and metadata
- Header image support

## Content

This post was created using the webhook API to demonstrate remote blog posting capabilities.

**Pretty cool, right?** 🎉`,
    summary: 'A test post created via webhook to demonstrate remote posting capabilities',
    tags: ['webhook', 'test', 'automation'],
    draft: false,
    headerImage:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    headerImageAlt: 'Laptop with code on screen representing webhook automation',
    slug: 'test-webhook-post',
  }

  try {
    const response = await sendWebhook('POST', postData)
    console.log('✅ Create Post Response:', response)
    return response.data.slug
  } catch (error) {
    console.error('❌ Create Post Error:', error)
    return null
  }
}

async function testUpdatePost(slug) {
  console.log('🔄 Testing webhook: Update Post')

  const updateData = {
    slug: slug,
    title: 'Updated Test Webhook Post',
    content: `# Updated Test Webhook Post

This post has been **updated** via webhook!

## Update Features Tested

- Remote post updating
- Content modification
- Metadata changes

## Updated Content

This demonstrates that the webhook can successfully update existing blog posts.

**Update successful!** ✨`,
    summary: 'An updated test post demonstrating webhook update capabilities',
    tags: ['webhook', 'test', 'automation', 'updated'],
    draft: false,
    headerImage:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    headerImageAlt: 'Updated image showing data and analytics',
  }

  try {
    const response = await sendWebhook('PUT', updateData)
    console.log('✅ Update Post Response:', response)
    return true
  } catch (error) {
    console.error('❌ Update Post Error:', error)
    return false
  }
}

async function testDeletePost(slug) {
  console.log('🗑️  Testing webhook: Delete Post')

  const deleteData = {
    slug: slug,
  }

  try {
    const response = await sendWebhook('DELETE', deleteData)
    console.log('✅ Delete Post Response:', response)
    return true
  } catch (error) {
    console.error('❌ Delete Post Error:', error)
    return false
  }
}

async function runTests() {
  console.log('🧪 Starting Webhook Tests\n')

  // Test 1: Create Post
  const slug = await testCreatePost()
  if (!slug) {
    console.log('❌ Tests failed at create step')
    return
  }

  console.log(`\n⏳ Waiting 2 seconds before update test...\n`)
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Test 2: Update Post
  const updateSuccess = await testUpdatePost(slug)
  if (!updateSuccess) {
    console.log('❌ Update test failed')
  }

  console.log(`\n⏳ Waiting 2 seconds before delete test...\n`)
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Test 3: Delete Post
  const deleteSuccess = await testDeletePost(slug)
  if (!deleteSuccess) {
    console.log('❌ Delete test failed')
  }

  console.log('\n🎉 Webhook tests completed!')
  console.log('\n📝 Check your blog to see if the operations worked correctly.')
  console.log('💡 The test post should have been created, updated, and then deleted.')
}

// Run the tests
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = { sendWebhook, generateSignature }

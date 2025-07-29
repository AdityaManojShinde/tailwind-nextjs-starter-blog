# Blog Webhook API Documentation

This webhook API allows you to remotely create, update, and delete blog posts via HTTP requests.

## Security

All webhook requests must include a signature header for security. The signature is generated using HMAC-SHA256 with your webhook secret.

## Environment Variables

Add these to your `.env.local` file:

```bash
WEBHOOK_SECRET=your-super-secure-webhook-secret-change-this-in-production
```

## Endpoints

### Base URL

```
https://yourdomain.com/api/webhook/blog
```

## 1. Create Blog Post

**Method:** `POST`  
**Endpoint:** `/api/webhook/blog`

### Headers

```
Content-Type: application/json
X-Webhook-Signature: sha256=<signature>
```

### Request Body

```json
{
  "title": "My New Blog Post",
  "content": "# Hello World\n\nThis is my blog post content in markdown.",
  "summary": "A brief summary of the post",
  "tags": ["javascript", "nextjs", "blog"],
  "draft": false,
  "headerImage": "https://example.com/image.jpg",
  "headerImageAlt": "Description of the image",
  "slug": "my-new-blog-post",
  "date": "2025-01-29T10:00:00.000Z"
}
```

### Required Fields

- `title` (string): The blog post title
- `content` (string): The blog post content in Markdown

### Optional Fields

- `summary` (string): Brief description of the post
- `tags` (array): Array of tag strings
- `draft` (boolean): Whether the post is a draft (default: false)
- `headerImage` (string): URL to header image
- `headerImageAlt` (string): Alt text for header image
- `slug` (string): Custom slug (auto-generated from title if not provided)
- `date` (string): ISO date string (defaults to current date)

### Response

```json
{
  "success": true,
  "message": "Blog post created successfully",
  "slug": "my-new-blog-post",
  "fileName": "my-new-blog-post.mdx",
  "url": "/blog/my-new-blog-post"
}
```

## 2. Update Blog Post

**Method:** `PUT`  
**Endpoint:** `/api/webhook/blog`

### Headers

```
Content-Type: application/json
X-Webhook-Signature: sha256=<signature>
```

### Request Body

```json
{
  "slug": "existing-post-slug",
  "title": "Updated Blog Post Title",
  "content": "# Updated Content\n\nThis is the updated content.",
  "summary": "Updated summary",
  "tags": ["updated", "tags"],
  "draft": false,
  "headerImage": "https://example.com/new-image.jpg",
  "headerImageAlt": "New image description",
  "date": "2025-01-29T10:00:00.000Z"
}
```

### Required Fields

- `slug` (string): The slug of the post to update
- `title` (string): The blog post title
- `content` (string): The blog post content in Markdown

### Response

```json
{
  "success": true,
  "message": "Blog post updated successfully",
  "slug": "existing-post-slug",
  "fileName": "existing-post-slug.mdx",
  "url": "/blog/existing-post-slug"
}
```

## 3. Delete Blog Post

**Method:** `DELETE`  
**Endpoint:** `/api/webhook/blog`

### Headers

```
Content-Type: application/json
X-Webhook-Signature: sha256=<signature>
```

### Request Body

```json
{
  "slug": "post-to-delete"
}
```

### Required Fields

- `slug` (string): The slug of the post to delete

### Response

```json
{
  "success": true,
  "message": "Blog post deleted successfully",
  "slug": "post-to-delete"
}
```

## Generating Signatures

The signature is generated using HMAC-SHA256. Here are examples in different languages:

### JavaScript/Node.js

```javascript
const crypto = require('crypto')

function generateSignature(payload, secret) {
  return 'sha256=' + crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

// Usage
const payload = JSON.stringify(requestBody)
const signature = generateSignature(payload, 'your-webhook-secret')
```

### Python

```python
import hmac
import hashlib
import json

def generate_signature(payload, secret):
    signature = hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    return f'sha256={signature}'

# Usage
payload = json.dumps(request_body)
signature = generate_signature(payload, 'your-webhook-secret')
```

### cURL Example

```bash
#!/bin/bash

SECRET="your-webhook-secret"
PAYLOAD='{"title":"Test Post","content":"# Test\n\nThis is a test post."}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* /sha256=/')

curl -X POST https://yourdomain.com/api/webhook/blog \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

## Error Responses

### 400 Bad Request

```json
{
  "error": "Title and content are required"
}
```

### 401 Unauthorized

```json
{
  "error": "Invalid webhook signature"
}
```

### 404 Not Found

```json
{
  "error": "Post with slug \"non-existent-post\" not found"
}
```

### 409 Conflict

```json
{
  "error": "Post with slug \"existing-post\" already exists"
}
```

### 500 Internal Server Error

```json
{
  "error": "Failed to create blog post"
}
```

## Integration Examples

### GitHub Actions

You can use this webhook with GitHub Actions to automatically publish blog posts:

```yaml
name: Publish Blog Post
on:
  push:
    paths: ['posts/**']

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Publish to Blog
        run: |
          # Generate signature and send webhook
          # Implementation depends on your setup
```

### Zapier/Make.com

You can integrate this webhook with automation platforms like Zapier or Make.com to publish posts from various sources (Google Docs, Notion, etc.).

### Content Management Systems

Integrate with headless CMS platforms to automatically sync content to your blog.

## Security Best Practices

1. **Keep your webhook secret secure** - Never commit it to version control
2. **Use HTTPS** - Always use HTTPS in production
3. **Validate signatures** - Always verify the webhook signature
4. **Rate limiting** - Consider implementing rate limiting for the webhook endpoint
5. **Logging** - Log webhook requests for debugging and monitoring

## Testing

You can test the webhook using tools like:

- Postman
- cURL
- Insomnia
- Custom scripts

Make sure to generate the correct signature for each request!

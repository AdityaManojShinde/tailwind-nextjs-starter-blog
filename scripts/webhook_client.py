#!/usr/bin/env python3
"""
Blog Webhook Client - Python Example

This script demonstrates how to use the blog webhook API from Python.
"""

import hmac
import hashlib
import json
import requests
from datetime import datetime
from typing import Dict, Any, Optional

class BlogWebhookClient:
    def __init__(self, webhook_url: str, webhook_secret: str):
        self.webhook_url = webhook_url
        self.webhook_secret = webhook_secret
    
    def _generate_signature(self, payload: str) -> str:
        """Generate HMAC-SHA256 signature for webhook authentication."""
        signature = hmac.new(
            self.webhook_secret.encode('utf-8'),
            payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return f'sha256={signature}'
    
    def _make_request(self, method: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make authenticated webhook request."""
        payload = json.dumps(data, separators=(',', ':'))
        signature = self._generate_signature(payload)
        
        headers = {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature
        }
        
        response = requests.request(method, self.webhook_url, headers=headers, data=payload)
        
        try:
            return {
                'status_code': response.status_code,
                'data': response.json(),
                'success': response.status_code < 400
            }
        except json.JSONDecodeError:
            return {
                'status_code': response.status_code,
                'data': {'error': response.text},
                'success': False
            }
    
    def create_post(self, 
                   title: str, 
                   content: str,
                   summary: Optional[str] = None,
                   tags: Optional[list] = None,
                   draft: bool = False,
                   header_image: Optional[str] = None,
                   header_image_alt: Optional[str] = None,
                   slug: Optional[str] = None,
                   date: Optional[str] = None) -> Dict[str, Any]:
        """Create a new blog post."""
        data = {
            'title': title,
            'content': content,
            'draft': draft
        }
        
        if summary:
            data['summary'] = summary
        if tags:
            data['tags'] = tags
        if header_image:
            data['headerImage'] = header_image
        if header_image_alt:
            data['headerImageAlt'] = header_image_alt
        if slug:
            data['slug'] = slug
        if date:
            data['date'] = date
        else:
            data['date'] = datetime.now().isoformat()
        
        return self._make_request('POST', data)
    
    def update_post(self,
                   slug: str,
                   title: str,
                   content: str,
                   summary: Optional[str] = None,
                   tags: Optional[list] = None,
                   draft: bool = False,
                   header_image: Optional[str] = None,
                   header_image_alt: Optional[str] = None,
                   date: Optional[str] = None) -> Dict[str, Any]:
        """Update an existing blog post."""
        data = {
            'slug': slug,
            'title': title,
            'content': content,
            'draft': draft
        }
        
        if summary:
            data['summary'] = summary
        if tags:
            data['tags'] = tags
        if header_image:
            data['headerImage'] = header_image
        if header_image_alt:
            data['headerImageAlt'] = header_image_alt
        if date:
            data['date'] = date
        
        return self._make_request('PUT', data)
    
    def delete_post(self, slug: str) -> Dict[str, Any]:
        """Delete a blog post."""
        data = {'slug': slug}
        return self._make_request('DELETE', data)


def example_usage():
    """Example usage of the BlogWebhookClient."""
    
    # Configuration
    WEBHOOK_URL = 'http://localhost:3000/api/webhook/blog'  # Change to your domain
    WEBHOOK_SECRET = 'your-super-secure-webhook-secret-change-this-in-production'
    
    # Initialize client
    client = BlogWebhookClient(WEBHOOK_URL, WEBHOOK_SECRET)
    
    print("🚀 Testing Blog Webhook Client (Python)")
    print("=" * 50)
    
    # Example 1: Create a post
    print("\n📝 Creating a new blog post...")
    create_response = client.create_post(
        title="Python Webhook Test Post",
        content="""# Python Webhook Integration

This post was created using the Python webhook client!

## Features

- **Easy Integration**: Simple Python class for webhook operations
- **Authentication**: Secure HMAC-SHA256 signature verification
- **Full API Support**: Create, update, and delete operations

## Code Example

```python
client = BlogWebhookClient(webhook_url, webhook_secret)
response = client.create_post(
    title="My Post",
    content="# Hello World\\n\\nThis is my content.",
    tags=["python", "webhook"]
)
```

Pretty neat! 🐍✨""",
        summary="A test post demonstrating Python webhook integration",
        tags=["python", "webhook", "automation", "api"],
        header_image="https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-4.0.3&auto=format&fit=crop&w=2064&q=80",
        header_image_alt="Python code on a computer screen",
        slug="python-webhook-test"
    )
    
    print(f"Status: {create_response['status_code']}")
    print(f"Response: {json.dumps(create_response['data'], indent=2)}")
    
    if create_response['success']:
        slug = create_response['data'].get('slug')
        
        # Example 2: Update the post
        print(f"\n🔄 Updating post '{slug}'...")
        update_response = client.update_post(
            slug=slug,
            title="Updated Python Webhook Test Post",
            content="""# Updated Python Webhook Integration

This post has been **updated** using the Python webhook client!

## Updated Features

- **Easy Integration**: Simple Python class for webhook operations
- **Authentication**: Secure HMAC-SHA256 signature verification
- **Full API Support**: Create, update, and delete operations
- **Update Support**: Posts can be modified remotely

## Updated Code Example

```python
# Update an existing post
response = client.update_post(
    slug="existing-post",
    title="Updated Title",
    content="# Updated Content\\n\\nNew information here.",
    tags=["python", "webhook", "updated"]
)
```

**Update successful!** 🎉🐍""",
            summary="An updated test post demonstrating Python webhook update capabilities",
            tags=["python", "webhook", "automation", "api", "updated"],
            header_image="https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
            header_image_alt="Updated Python development environment"
        )
        
        print(f"Status: {update_response['status_code']}")
        print(f"Response: {json.dumps(update_response['data'], indent=2)}")
        
        # Example 3: Delete the post (uncomment to test)
        # print(f"\n🗑️ Deleting post '{slug}'...")
        # delete_response = client.delete_post(slug)
        # print(f"Status: {delete_response['status_code']}")
        # print(f"Response: {json.dumps(delete_response['data'], indent=2)}")
    
    print("\n✅ Python webhook client test completed!")
    print("💡 Check your blog to see the created/updated post.")


if __name__ == "__main__":
    try:
        example_usage()
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")

# Admin Dashboard Setup and Usage

This admin dashboard allows you to create, edit, and delete blog posts through a web interface.

## Setup

### 1. Environment Variables

Make sure you have the following environment variables set in your `.env.local` file:

```env
ADMIN_PASSWORD=your-secure-admin-password-here
JWT_SECRET=your-very-secure-jwt-secret-key-change-this-to-something-random
```

**Important Security Notes:**

- Change the default password to something secure
- Use a long, random string for the JWT secret
- Never commit your `.env.local` file to version control

### 2. Dependencies

The following dependencies have been installed:

- `jsonwebtoken` - For authentication tokens
- `gray-matter` - For parsing markdown frontmatter
- `@heroicons/react` - For UI icons
- `@types/jsonwebtoken` - TypeScript types

## Usage

### Accessing the Admin Dashboard

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/admin`
3. Enter your admin password
4. You'll be redirected to the dashboard

### Creating a New Post

1. Click the "New Post" button
2. Fill in the post details:
   - **Title**: The post title
   - **Slug**: URL-friendly version (auto-generated from title)
   - **Date**: Publication date
   - **Summary**: Brief description for the post list
   - **Tags**: Comma-separated tags
   - **Draft**: Check to save as draft
   - **Content**: Write your post in Markdown
3. Click "Create Post"

### Editing a Post

1. Find the post in the dashboard list
2. Click the edit icon (pencil)
3. Make your changes
4. Click "Update Post"

### Deleting a Post

1. Find the post in the dashboard list
2. Click the delete icon (trash)
3. Confirm the deletion

### Searching Posts

Use the search bar to filter posts by title, summary, or tags.

## File Structure

The admin dashboard consists of:

```
app/
├── admin/
│   └── page.tsx              # Admin login and main page
├── api/
│   └── admin/
│       ├── login/
│       │   └── route.ts      # Authentication endpoint
│       ├── verify/
│       │   └── route.ts      # Token verification
│       └── posts/
│           ├── route.ts      # List and create posts
│           └── [slug]/
│               ├── route.ts  # Update and delete posts
│               └── content/
│                   └── route.ts # Get post content
components/
├── AdminDashboard.tsx        # Main dashboard component
└── BlogEditor.tsx           # Post editor component
```

## Security Features

- **Password Protection**: Simple password-based authentication
- **JWT Tokens**: Secure session management with 24-hour expiration
- **Authorization Headers**: API endpoints require valid tokens
- **Input Validation**: Server-side validation of post data

## Customization

### Changing the Admin Password

Update the `ADMIN_PASSWORD` in your `.env.local` file and restart the server.

### Extending Functionality

You can extend the admin dashboard by:

- Adding user management
- Implementing role-based access
- Adding image upload functionality
- Creating post scheduling features
- Adding analytics and metrics

## Troubleshooting

### Common Issues

1. **"Invalid password" error**: Check your `.env.local` file and restart the server
2. **"Unauthorized" errors**: Your session may have expired, log in again
3. **Posts not appearing**: Ensure your blog posts are in the `data/blog/` directory
4. **Build errors**: Make sure all dependencies are installed with `npm install`

### Development vs Production

For production deployment:

1. Set strong environment variables
2. Consider implementing more robust authentication
3. Add rate limiting to prevent brute force attacks
4. Use HTTPS for secure token transmission

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your environment variables are set correctly
3. Ensure all dependencies are installed
4. Check that the `data/blog/` directory exists and is writable

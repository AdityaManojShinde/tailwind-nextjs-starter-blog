# Vercel Deployment Guide

This guide will help you deploy your blog to Vercel with all features working correctly.

## Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Environment Variables** - Prepare your environment variables

## Step 1: Prepare Your Repository

1. **Push to GitHub**:

   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Ensure all files are committed**:
   - `.env.local` should NOT be committed (it's in .gitignore)
   - `.env.example` should be committed as a template

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect it's a Next.js project
5. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:

   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

## Step 3: Configure Environment Variables

In your Vercel dashboard:

1. Go to your project
2. Click "Settings" → "Environment Variables"
3. Add these required variables:

### Required Variables

```bash
# Admin Dashboard
ADMIN_PASSWORD=your-secure-admin-password
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Webhook System
WEBHOOK_SECRET=your-super-secure-webhook-secret-change-this-in-production

# Site URL (replace with your actual domain)
NEXT_PUBLIC_SITE_URL=https://your-site.vercel.app
```

### Optional Variables (if you want to use these features)

```bash
# Newsletter (Mailchimp example)
MAILCHIMP_API_KEY=your-mailchimp-api-key
MAILCHIMP_API_SERVER=us1
MAILCHIMP_AUDIENCE_ID=your-audience-id

# Comments (Giscus example)
NEXT_PUBLIC_GISCUS_REPO=username/repo
NEXT_PUBLIC_GISCUS_REPOSITORY_ID=your-repo-id
NEXT_PUBLIC_GISCUS_CATEGORY=General
NEXT_PUBLIC_GISCUS_CATEGORY_ID=your-category-id

# Analytics (Umami example)
NEXT_PUBLIC_UMAMI_WEBSITE_ID=your-umami-id
```

## Step 4: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to "Settings" → "Domains"
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions
4. Update `NEXT_PUBLIC_SITE_URL` to your custom domain

## Step 5: Test Your Deployment

### Test Basic Functionality

1. Visit your deployed site
2. Check that the blog loads correctly
3. Verify images are displaying properly

### Test Admin Dashboard

1. Go to `https://your-site.vercel.app/admin`
2. Login with your `ADMIN_PASSWORD`
3. Try creating, editing, and deleting posts
4. Test tag management

### Test Webhook API

1. Use the test script:

   ```bash
   # Update the URL in scripts/test-webhook.js to your Vercel URL
   npm run test-webhook
   ```

2. Or test manually with curl:
   ```bash
   # Generate signature (see WEBHOOK_README.md for details)
   curl -X POST https://your-site.vercel.app/api/webhook/blog \
     -H "Content-Type: application/json" \
     -H "X-Webhook-Signature: sha256=YOUR_SIGNATURE" \
     -d '{"title":"Test Post","content":"# Hello World"}'
   ```

## Step 6: Set Up Automatic Deployments

Vercel automatically deploys when you push to your main branch. To customize:

1. Go to "Settings" → "Git"
2. Configure branch settings
3. Set up preview deployments for pull requests

## Troubleshooting

### Common Issues

1. **Build Errors**:
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`
   - Verify TypeScript types are correct

2. **Environment Variables Not Working**:
   - Make sure variables are set in Vercel dashboard
   - Redeploy after adding new variables
   - Check variable names match exactly

3. **Images Not Loading**:
   - Verify image domains are in `next.config.js`
   - Check Content Security Policy settings
   - Ensure images are accessible publicly

4. **API Routes Failing**:
   - Check function logs in Vercel dashboard
   - Verify API routes are in correct directory structure
   - Check for missing dependencies

5. **Contentlayer Issues**:
   - Ensure `.contentlayer` is in `.gitignore`
   - Check that blog posts have correct frontmatter
   - Verify markdown files are in `data/blog/` directory

### Performance Optimization

1. **Enable Analytics**:
   - Go to "Analytics" tab in Vercel dashboard
   - Monitor Core Web Vitals

2. **Optimize Images**:
   - Use Next.js Image component
   - Ensure proper image formats (WebP when possible)

3. **Monitor Bundle Size**:
   ```bash
   npm run analyze
   ```

## Security Considerations

1. **Environment Variables**:
   - Never commit `.env.local` to git
   - Use strong, unique secrets
   - Rotate secrets periodically

2. **Admin Access**:
   - Use a strong admin password
   - Consider IP restrictions if needed
   - Monitor admin access logs

3. **Webhook Security**:
   - Always verify webhook signatures
   - Use HTTPS only
   - Monitor webhook usage

## Maintenance

### Regular Updates

```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Deploy updates
git add .
git commit -m "Update dependencies"
git push origin main
```

### Backup

- Your blog posts are in the git repository
- Environment variables should be documented securely
- Consider backing up your Vercel project settings

## Support

If you encounter issues:

1. Check Vercel's [documentation](https://vercel.com/docs)
2. Review build logs in Vercel dashboard
3. Check the project's GitHub issues
4. Consult Next.js [documentation](https://nextjs.org/docs)

## Post-Deployment Checklist

- [ ] Site loads correctly
- [ ] Admin dashboard accessible
- [ ] Blog posts display with images
- [ ] Webhook API responds correctly
- [ ] Environment variables configured
- [ ] Custom domain configured (if applicable)
- [ ] Analytics working (if configured)
- [ ] Newsletter signup working (if configured)
- [ ] Performance metrics acceptable
- [ ] Security headers configured

Your blog is now ready for production use! 🎉

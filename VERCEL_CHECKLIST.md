# Vercel Deployment Checklist ✅

Use this checklist to ensure your blog is ready for Vercel deployment.

## Pre-Deployment Checklist

### 🔧 Code Preparation

- [ ] All TypeScript errors resolved
- [ ] All import paths use `.contentlayer/generated` (not `contentlayer/generated`)
- [ ] No console.log statements in production code
- [ ] All components properly exported
- [ ] Build test passes: `npm run build-test`

### 📁 File Structure

- [ ] `next.config.js` configured with image domains
- [ ] `vercel.json` present with proper configuration
- [ ] `.env.example` updated with all required variables
- [ ] `.gitignore` includes `.env.local` and `.contentlayer`
- [ ] Blog posts exist in `data/blog/` directory

### 🔐 Environment Variables Ready

- [ ] `ADMIN_PASSWORD` - Strong password for admin access
- [ ] `JWT_SECRET` - Secure JWT signing key
- [ ] `WEBHOOK_SECRET` - Secure webhook authentication key
- [ ] `NEXT_PUBLIC_SITE_URL` - Your site URL (will be updated after deployment)

### 🧪 Testing

- [ ] Local build successful: `npm run build`
- [ ] Admin dashboard works locally
- [ ] Blog posts display correctly
- [ ] Images load properly
- [ ] Webhook API responds (if testing locally)

## Deployment Steps

### 1. GitHub Repository

- [ ] Code pushed to GitHub repository
- [ ] Repository is public or you have Vercel access
- [ ] Main branch is up to date

### 2. Vercel Setup

- [ ] Vercel account created
- [ ] Repository connected to Vercel
- [ ] Project imported successfully

### 3. Environment Variables in Vercel

Go to Project Settings → Environment Variables and add:

```bash
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret-key
WEBHOOK_SECRET=your-webhook-secret
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
```

### 4. Deploy

- [ ] Initial deployment successful
- [ ] No build errors in Vercel logs
- [ ] Site loads at Vercel URL

## Post-Deployment Testing

### 🌐 Basic Functionality

- [ ] Homepage loads correctly
- [ ] Blog listing page works
- [ ] Individual blog posts display
- [ ] Images load properly
- [ ] Navigation works
- [ ] Mobile responsive

### 🔑 Admin Dashboard

- [ ] `/admin` page accessible
- [ ] Login with admin password works
- [ ] Can create new posts
- [ ] Can edit existing posts
- [ ] Can delete posts
- [ ] Image URLs work in posts

### 🔗 API Endpoints

- [ ] `/api/admin/login` responds
- [ ] `/api/admin/posts` responds
- [ ] `/api/webhook/blog` responds (test with proper signature)

### 🎨 Styling & Performance

- [ ] Tailwind CSS styles applied
- [ ] Dark mode toggle works (if enabled)
- [ ] Page load times acceptable
- [ ] Core Web Vitals good

## Optional Configurations

### Custom Domain

- [ ] Domain added in Vercel dashboard
- [ ] DNS configured correctly
- [ ] SSL certificate active
- [ ] `NEXT_PUBLIC_SITE_URL` updated to custom domain

### Analytics (if desired)

- [ ] Analytics service configured
- [ ] Environment variables set
- [ ] Tracking working

### Newsletter (if desired)

- [ ] Email service configured
- [ ] API keys set in environment variables
- [ ] Signup form working

## Troubleshooting Common Issues

### Build Failures

1. Check Vercel build logs
2. Verify all dependencies in `package.json`
3. Ensure TypeScript types are correct
4. Check for missing environment variables

### Runtime Errors

1. Check Vercel function logs
2. Verify API routes are correct
3. Check environment variable names
4. Ensure proper error handling

### Image Issues

1. Verify domains in `next.config.js`
2. Check image URLs are accessible
3. Verify Content Security Policy

### Admin Dashboard Issues

1. Check environment variables are set
2. Verify JWT_SECRET is configured
3. Check browser console for errors
4. Ensure API routes are working

## Performance Optimization

### After Deployment

- [ ] Enable Vercel Analytics
- [ ] Monitor Core Web Vitals
- [ ] Optimize images if needed
- [ ] Check bundle size with `npm run analyze`

### SEO

- [ ] Update `siteMetadata.js` with correct URLs
- [ ] Verify meta tags are correct
- [ ] Check sitemap generation
- [ ] Test social media previews

## Security Review

### Production Security

- [ ] Strong admin password set
- [ ] JWT secret is secure and unique
- [ ] Webhook secret is secure and unique
- [ ] No sensitive data in client-side code
- [ ] HTTPS enforced
- [ ] Security headers configured

## Maintenance

### Regular Tasks

- [ ] Monitor Vercel usage and limits
- [ ] Update dependencies regularly
- [ ] Backup blog content (it's in git!)
- [ ] Monitor performance metrics
- [ ] Review security settings

## Success Criteria

Your deployment is successful when:

- ✅ Site loads without errors
- ✅ Admin dashboard is accessible and functional
- ✅ Blog posts display correctly with images
- ✅ Webhook API responds correctly
- ✅ Performance is acceptable
- ✅ All features work as expected

## Quick Test Commands

```bash
# Test build locally
npm run build-test

# Test webhook (update URL first)
npm run test-webhook

# Analyze bundle size
npm run analyze

# Check for security issues
npm audit
```

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Contentlayer Documentation](https://contentlayer.dev/docs)

---

**Ready to deploy?** 🚀

1. Complete this checklist
2. Run `npm run build-test`
3. Push to GitHub
4. Deploy on Vercel
5. Configure environment variables
6. Test everything!

Your blog will be live and ready for the world! 🌍

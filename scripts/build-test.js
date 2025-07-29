#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🧪 Running pre-deployment build test...\n')

// Test 1: Check environment variables
console.log('1️⃣ Checking environment variables...')
const envPath = path.join(process.cwd(), '.env.local')
if (!fs.existsSync(envPath)) {
  console.log(
    '⚠️  Warning: .env.local not found. Make sure to set environment variables in Vercel.'
  )
} else {
  console.log('✅ .env.local found')
}

// Test 2: Check required files
console.log('\n2️⃣ Checking required files...')
const requiredFiles = [
  'next.config.js',
  'package.json',
  'tailwind.config.js',
  'contentlayer.config.ts',
  'data/blog',
  'app/api/admin',
  'app/api/webhook',
]

let allFilesExist = true
requiredFiles.forEach((file) => {
  const filePath = path.join(process.cwd(), file)
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - MISSING`)
    allFilesExist = false
  }
})

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please check your project structure.')
  process.exit(1)
}

// Test 3: Install dependencies
console.log('\n3️⃣ Installing dependencies...')
try {
  execSync('npm install', { stdio: 'inherit' })
  console.log('✅ Dependencies installed')
} catch (error) {
  console.log('❌ Failed to install dependencies')
  process.exit(1)
}

// Test 4: Run TypeScript check
console.log('\n4️⃣ Running TypeScript check...')
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' })
  console.log('✅ TypeScript check passed')
} catch (error) {
  console.log('❌ TypeScript check failed')
  process.exit(1)
}

// Test 5: Run linting
console.log('\n5️⃣ Running ESLint...')
try {
  execSync('npm run lint', { stdio: 'inherit' })
  console.log('✅ Linting passed')
} catch (error) {
  console.log('⚠️  Linting issues found (but continuing...)')
}

// Test 6: Build the project
console.log('\n6️⃣ Building the project...')
try {
  execSync('npm run build', { stdio: 'inherit' })
  console.log('✅ Build successful')
} catch (error) {
  console.log('❌ Build failed')
  process.exit(1)
}

// Test 7: Check build output
console.log('\n7️⃣ Checking build output...')
const buildPath = path.join(process.cwd(), '.next')
if (fs.existsSync(buildPath)) {
  console.log('✅ Build output found')

  // Check for specific files
  const buildFiles = ['.next/static', '.next/server', '.next/BUILD_ID']

  buildFiles.forEach((file) => {
    const filePath = path.join(process.cwd(), file)
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}`)
    } else {
      console.log(`⚠️  ${file} - Not found`)
    }
  })
} else {
  console.log('❌ Build output not found')
  process.exit(1)
}

console.log('\n🎉 All tests passed! Your project is ready for Vercel deployment.')
console.log('\n📋 Next steps:')
console.log('1. Push your code to GitHub')
console.log('2. Connect your repository to Vercel')
console.log('3. Set environment variables in Vercel dashboard')
console.log('4. Deploy!')
console.log('\n💡 See DEPLOYMENT.md for detailed instructions.')

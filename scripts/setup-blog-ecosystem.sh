#!/bin/bash

# Blog Ecosystem Setup Script
# This script sets up the blog ecosystem with Sarah Johnson's account and blog post

echo "🎉 Setting up Blog Ecosystem..."

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first."
    echo "npm install -g supabase"
    exit 1
fi

# Run the blog ecosystem setup
echo "📝 Running blog ecosystem setup..."
supabase db push --linked --include-all

if [ $? -ne 0 ]; then
    echo "❌ Blog ecosystem setup failed"
    exit 1
fi

echo "✅ Blog ecosystem setup completed successfully"

echo ""
echo "🎉 Blog Ecosystem Setup Complete!"
echo ""
echo "✅ Created dummy user account for Sarah Johnson"
echo "✅ Created profile for Sarah Johnson"
echo "✅ Created artist profile for Sarah Johnson"
echo "✅ Created blog post: 'The Future of Independent Music'"
echo "✅ Created regular post linking to the blog"
echo "✅ Added engagement data (likes, comments)"
echo "✅ Created account entry for Sarah Johnson"
echo ""
echo "📝 Blog Post Details:"
echo "   - Title: The Future of Independent Music"
echo "   - Slug: the-future-of-independent-music"
echo "   - Author: Sarah Johnson (@sarahjohnson)"
echo "   - Published: 1 day ago"
echo "   - Views: 1,247 | Likes: 89 | Comments: 23 | Shares: 45"
echo ""
echo "🔗 You can now:"
echo "   - View the blog post on the feed page (/feed)"
echo "   - Visit the blog post directly at /blog/the-future-of-independent-music"
echo "   - Visit Sarah Johnson's profile to see her blog posts"
echo "   - See the blog post in the blog ecosystem"
echo ""
echo "🚀 The blog ecosystem is now fully functional!" 
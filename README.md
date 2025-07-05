This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deploy to GitHub Pages

This project is configured for automatic deployment to GitHub Pages.

### Setup Instructions:

1. **Push your code to GitHub**: Make sure your repository is on GitHub
2. **Enable GitHub Pages**: 
   - Go to your repository settings
   - Navigate to "Pages" in the sidebar
   - Under "Source", select "GitHub Actions"
3. **Automatic Deployment**: The GitHub Actions workflow will automatically build and deploy your site when you push to the `main` branch

### Manual Build:

To build the project for different environments:

```bash
# For local testing (no base path)
pnpm run build:local

# For production deployment (with /dashboard base path)
pnpm run build:prod

# Default build (same as build:local)
pnpm run build
```

The static files will be generated in the `out/` directory.

### Testing Locally:

To test the static build locally:

```bash
# Option 1: Use the provided script
./scripts/serve-local.sh

# Option 2: Manual serve
npx serve out/ -p 3000

# Option 3: Using pnpm
pnpm dlx serve out/ -p 3000
```

**Important:** When testing locally, access your site at `http://localhost:3000` (not `/dashboard/`). The `/dashboard/` base path is only used when deployed to GitHub Pages.

### Environment Variables:

For Supabase to work, create a `.env.local` file in your project root:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_ADDRESS=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_API_KEY=your_supabase_anon_key_here
```

**Important:** Use your Supabase **anon key** (public key), not the service role key.

### Important Notes:

- The site will be available at: `https://[your-username].github.io/dashboard/`
- Make sure your repository is public or you have GitHub Pro for private repository deployment
- The build process creates a static export, so server-side features won't work
- For GitHub Pages deployment, you'll need to add the environment variables in your repository settings (Settings → Secrets and variables → Actions)

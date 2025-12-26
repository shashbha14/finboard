This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, set up your environment variables by creating a `.env.local` file in the root directory:

```bash
# API Keys for Stock Data Services

# Finnhub API Token
# Get your token from: https://finnhub.io/
NEXT_PUBLIC_FINNHUB_TOKEN=your_finnhub_token_here
# Alternative (server-side only):
FINNHUB_TOKEN=your_finnhub_token_here

# Alpha Vantage API Key
# Get your key from: https://www.alphavantage.co/support/#api-key
NEXT_PUBLIC_ALPHAVANTAGE_TOKEN=your_alphavantage_key_here
# Alternative (server-side only):
ALPHAVANTAGE_TOKEN=your_alphavantage_key_here

# Indian Stock API Key
# Get your key from: https://stock.indianapi.in/
NEXT_PUBLIC_INDIAN_API_KEY=your_indian_api_key_here
# Alternative (server-side only):
INDIAN_API_KEY=your_indian_api_key_here
```

Then, run the development server:

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

# Life OS

Life OS is your personal operating system for life management - a comprehensive productivity platform built with Next.js and Express.js.

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

## Backend Server

The backend server runs on port 5001 and includes:

### Health Endpoint

A health check endpoint is available at `/health` to prevent cold starts on hosting platforms like Render:

```
GET /health
```

Response:
```json
{
  "status": "OK",
  "message": "Server is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

You can set up a cron job at [cron-job.org](https://cron-job.org) to ping this endpoint every few minutes to keep your server warm.

### Running the Backend

```bash
cd backend
npm install
npm start
# or for development
npm run dev
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

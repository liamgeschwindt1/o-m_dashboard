# Tiera O&M Studio Deployment Guide

## 1. Environment Variables

### Vercel (Frontend)
- `NEXT_PUBLIC_BACKEND_URL`: The URL of the FastAPI backend (e.g., `https://api.tiera-studio.com`)

### Backend Host (Render.com, Railway.app, etc.)
- `GRAPHOPPER_API_KEY`: Your GraphHopper API Key (never hardcode in code)
- `ALLOWED_ORIGINS`: The Vercel frontend URL (e.g., `https://tiera-frontend.vercel.app`)
- `RESEND_API_KEY` or `SENDGRID_API_KEY`: For email service integration

## 2. CI/CD Workflow
- Push to GitHub triggers deployments on Vercel (frontend) and Render/Railway (backend) if connected.
- Use protected branches and PR reviews for production.

## 3. FastAPI Backend
- Dockerized for easy deployment.
- CORS is restricted to the frontend URL via `ALLOWED_ORIGINS`.
- API keys are always set via environment variables.

## 4. Next.js Frontend
- Reads backend URL from `NEXT_PUBLIC_BACKEND_URL`.
- Framer Motion onboarding is optimized for production (ensure `framer-motion` is in dependencies and use dynamic imports if needed).

## 5. Submission Bridge
- The frontend POSTs the route JSON and user email to the backend `/submit` endpoint.
- The backend formats and sends an email via Resend or SendGrid, then returns a success response.

---

**For more details, see the code comments and .env.example files in each project.**

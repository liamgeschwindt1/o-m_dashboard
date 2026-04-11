# main.py for FastAPI backend (core structure for deployment)
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
from pydantic import BaseModel
from typing import Any

# Email service (Resend or SendGrid)
import httpx

app = FastAPI()

# CORS setup
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GRAPHOPPER_API_KEY = os.getenv("GRAPHOPPER_API_KEY")
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")

class Submission(BaseModel):
    email: str
    payload: Any

@app.post("/submit")
async def submit_route(sub: Submission):
    # Format email
    subject = "New Custom Route Submission"
    body = f"User: {sub.email}\n\nPayload:\n{sub.payload}"
    # Try Resend first
    if RESEND_API_KEY:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
                json={
                    "from": "studio@tiera.com",
                    "to": [sub.email],
                    "subject": subject,
                    "text": body,
                },
                timeout=10.0,
            )
            if resp.status_code == 200:
                return {"success": True}
            else:
                raise HTTPException(status_code=500, detail="Email send failed (Resend)")
    # Fallback: SendGrid
    elif SENDGRID_API_KEY:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={
                    "Authorization": f"Bearer {SENDGRID_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "personalizations": [{"to": [{"email": sub.email}]}],
                    "from": {"email": "studio@tiera.com"},
                    "subject": subject,
                    "content": [{"type": "text/plain", "value": body}]
                },
                timeout=10.0,
            )
            if resp.status_code in (200, 202):
                return {"success": True}
            else:
                raise HTTPException(status_code=500, detail="Email send failed (SendGrid)")
    else:
        raise HTTPException(status_code=500, detail="No email service configured")

@app.get("/")
def root():
    return {"status": "Tiera O&M Studio FastAPI backend running"}

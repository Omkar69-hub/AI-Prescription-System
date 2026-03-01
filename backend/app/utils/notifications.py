# backend/app/utils/notifications.py
"""
Unified notification service for the AI Prescription System.

Channels implemented:
  • Email  — via SMTP (Gmail app-password or any SMTP server)
  • SMS    — via Twilio REST API (optional, logs to DB if not configured)

All notification calls are fire-and-forget background tasks so they never
block the login response.

Required .env keys:
─────────────────────────────────────────────────────────────
NOTIFY_EMAIL_ENABLED=true
NOTIFY_SMTP_HOST=smtp.gmail.com
NOTIFY_SMTP_PORT=587
NOTIFY_SMTP_USER=your@gmail.com
NOTIFY_SMTP_PASS=your_app_password        # Gmail App Password
NOTIFY_FROM_NAME=AI Prescription System

NOTIFY_SMS_ENABLED=false                  # set true + add Twilio creds
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+1234567890
─────────────────────────────────────────────────────────────
"""

from __future__ import annotations

import asyncio
import logging
import os
import smtplib
import ssl
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

log = logging.getLogger(__name__)

# ─── Config (read once at import time) ───────────────────────────────────────
_EMAIL_ENABLED  = os.getenv("NOTIFY_EMAIL_ENABLED",  "false").lower() == "true"
_SMTP_HOST      = os.getenv("NOTIFY_SMTP_HOST",      "smtp.gmail.com")
_SMTP_PORT      = int(os.getenv("NOTIFY_SMTP_PORT",  "587"))
_SMTP_USER      = os.getenv("NOTIFY_SMTP_USER",      "")
_SMTP_PASS      = os.getenv("NOTIFY_SMTP_PASS",      "")
_FROM_NAME      = os.getenv("NOTIFY_FROM_NAME",      "AI Prescription System")

_SMS_ENABLED    = os.getenv("NOTIFY_SMS_ENABLED",    "false").lower() == "true"
_TWILIO_SID     = os.getenv("TWILIO_ACCOUNT_SID",    "")
_TWILIO_TOKEN   = os.getenv("TWILIO_AUTH_TOKEN",     "")
_TWILIO_FROM    = os.getenv("TWILIO_FROM_NUMBER",    "")


# ─── Welcome message templates ───────────────────────────────────────────────
_ROLE_LABELS = {
    "admin":   "Administrator",
    "doctor":  "Doctor",
    "patient": "Patient",
}

def _welcome_subject() -> str:
    return "Welcome to AI Prescription System — Login Successful"

def _welcome_body_html(full_name: str, role: str, login_time: str) -> str:
    role_label = _ROLE_LABELS.get(role, role.title())
    first_name = full_name.split()[0] if full_name else "there"
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Notification</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:16px;overflow:hidden;
                      box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#10b981,#059669);
                       padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;
                         letter-spacing:-0.5px;">
                AI Prescription System
              </h1>
              <p style="margin:6px 0 0;color:#d1fae5;font-size:14px;">
                Intelligent Health Management
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 28px;">
              <p style="margin:0 0 16px;color:#1e293b;font-size:22px;font-weight:700;">
                Hello, {first_name}! 👋
              </p>
              <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
                You have successfully logged into the
                <strong>AI Prescription System</strong> as a
                <strong style="color:#10b981;">{role_label}</strong>.
              </p>

              <!-- Info card -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:#f0fdf4;border:1px solid #bbf7d0;
                            border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 8px;color:#166534;font-size:13px;
                               font-weight:700;letter-spacing:0.5px;
                               text-transform:uppercase;">Login Details</p>
                    <table width="100%" cellpadding="4" cellspacing="0">
                      <tr>
                        <td style="color:#4b5563;font-size:13px;width:100px;">Role</td>
                        <td style="color:#1e293b;font-size:13px;font-weight:600;">
                          {role_label}
                        </td>
                      </tr>
                      <tr>
                        <td style="color:#4b5563;font-size:13px;">Time</td>
                        <td style="color:#1e293b;font-size:13px;font-weight:600;">
                          {login_time}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.6;">
                If you did not initiate this login, please change your password
                immediately and contact support.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 40px;
                       border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                © 2026 AI Prescription System &nbsp;•&nbsp;
                Secure, HIPAA-compliant health management
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

def _welcome_body_plain(full_name: str, role: str, login_time: str) -> str:
    role_label = _ROLE_LABELS.get(role, role.title())
    first_name = full_name.split()[0] if full_name else "there"
    return (
        f"Hello {first_name},\n\n"
        f"Welcome to the AI Prescription System!\n\n"
        f"You have successfully logged in as: {role_label}\n"
        f"Login time : {login_time}\n\n"
        "If you did not initiate this login, please change your password immediately.\n\n"
        "-- AI Prescription System Team"
    )

def _sms_text(full_name: str, role: str) -> str:
    role_label = _ROLE_LABELS.get(role, role.title())
    first_name = full_name.split()[0] if full_name else "User"
    return (
        f"Hi {first_name}! You've successfully logged into the AI Prescription System "
        f"as {role_label}. If this wasn't you, contact support immediately."
    )


# ─── Email sender (blocking — run in executor) ───────────────────────────────
def _send_email_sync(to_addr: str, subject: str, html: str, plain: str) -> None:
    """Send an email synchronously (called in a thread pool)."""
    if not (_SMTP_USER and _SMTP_PASS):
        log.warning("[Notify] SMTP credentials not configured — email skipped.")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = f"{_FROM_NAME} <{_SMTP_USER}>"
    msg["To"]      = to_addr

    msg.attach(MIMEText(plain, "plain", "utf-8"))
    msg.attach(MIMEText(html,  "html",  "utf-8"))

    context = ssl.create_default_context()
    try:
        with smtplib.SMTP(_SMTP_HOST, _SMTP_PORT, timeout=10) as server:
            server.ehlo()
            server.starttls(context=context)
            server.login(_SMTP_USER, _SMTP_PASS)
            server.sendmail(_SMTP_USER, to_addr, msg.as_string())
        log.info("[Notify] Email sent to %s", to_addr)
    except Exception as exc:
        log.error("[Notify] Email delivery failed: %s", exc)


# ─── SMS sender (via Twilio) ─────────────────────────────────────────────────
def _send_sms_twilio_sync(to_phone: str, body: str) -> None:
    """Send SMS via Twilio REST API synchronously (called in a thread pool)."""
    if not (_TWILIO_SID and _TWILIO_TOKEN and _TWILIO_FROM):
        log.warning("[Notify] Twilio credentials not configured — SMS skipped.")
        return
    try:
        import urllib.request, urllib.parse, base64, json

        url  = f"https://api.twilio.com/2010-04-01/Accounts/{_TWILIO_SID}/Messages.json"
        data = urllib.parse.urlencode({
            "To":   to_phone,
            "From": _TWILIO_FROM,
            "Body": body,
        }).encode()

        cred = base64.b64encode(f"{_TWILIO_SID}:{_TWILIO_TOKEN}".encode()).decode()
        req  = urllib.request.Request(url, data=data, headers={"Authorization": f"Basic {cred}"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read())
            log.info("[Notify] SMS sent (SID: %s) to %s", result.get("sid"), to_phone)
    except Exception as exc:
        log.error("[Notify] SMS delivery failed: %s", exc)


# ─── Public API — called from auth route ─────────────────────────────────────
async def send_login_notification(
    *,
    email: Optional[str],
    phone: Optional[str],
    full_name: str,
    role: str,
    db=None,          # AsyncIOMotorDatabase — for logging
) -> None:
    """
    Fire-and-forget welcome notification.
    - Sends an email if NOTIFY_EMAIL_ENABLED=true and email is present.
    - Sends an SMS  if NOTIFY_SMS_ENABLED=true  and phone is present.
    - Always records the notification in the DB (notifications collection).
    """
    now        = datetime.utcnow()
    login_time = now.strftime("%d %b %Y, %I:%M %p UTC")
    loop       = asyncio.get_event_loop()

    # ── Email ──────────────────────────────────────────────────────────────
    email_status = "disabled"
    if _EMAIL_ENABLED and email:
        html  = _welcome_body_html(full_name, role, login_time)
        plain = _welcome_body_plain(full_name, role, login_time)
        try:
            await loop.run_in_executor(
                None, _send_email_sync, email,
                _welcome_subject(), html, plain
            )
            email_status = "sent"
        except Exception as e:
            log.error("[Notify] Email task error: %s", e)
            email_status = "failed"
    elif not _EMAIL_ENABLED:
        log.info(
            "[Notify] Email disabled. Set NOTIFY_EMAIL_ENABLED=true in .env "
            "and configure SMTP credentials to enable it."
        )
        email_status = "not_configured"

    # ── SMS ────────────────────────────────────────────────────────────────
    sms_status = "disabled"
    if _SMS_ENABLED and phone:
        # Normalize: ensure leading + for Twilio
        normalized_phone = phone if phone.startswith("+") else f"+91{phone}"
        sms_body = _sms_text(full_name, role)
        try:
            await loop.run_in_executor(
                None, _send_sms_twilio_sync, normalized_phone, sms_body
            )
            sms_status = "sent"
        except Exception as e:
            log.error("[Notify] SMS task error: %s", e)
            sms_status = "failed"
    elif not _SMS_ENABLED:
        log.info(
            "[Notify] SMS disabled. Set NOTIFY_SMS_ENABLED=true and add "
            "Twilio credentials to .env to enable it."
        )
        sms_status = "not_configured"

    # ── DB logging ─────────────────────────────────────────────────────────
    if db is not None:
        try:
            await db["notifications"].insert_one({
                "type":         "login_welcome",
                "email":        email or "",
                "phone":        phone or "",
                "full_name":    full_name,
                "role":         role,
                "login_at":     now,
                "email_status": email_status,
                "sms_status":   sms_status,
            })
        except Exception as e:
            log.warning("[Notify] Could not log notification to DB: %s", e)

# backend/app/utils/notifications.py
"""
Login notification service — SMS only.

Sends "Welcome to AI Prescription System" via SMS to the user's
phone number after every successful login (if phone is on record).

SMS is sent via Twilio. Enable it in .env:
    NOTIFY_SMS_ENABLED=true
    TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
    TWILIO_AUTH_TOKEN=your_auth_token
    TWILIO_FROM_NUMBER=+1234567890
"""

from __future__ import annotations

import asyncio
import logging
import os
from datetime import datetime
from typing import Optional

log = logging.getLogger(__name__)

# ─── SMS config ───────────────────────────────────────────────────────────────
_SMS_ENABLED  = os.getenv("NOTIFY_SMS_ENABLED",  "false").lower() == "true"
_TWILIO_SID   = os.getenv("TWILIO_ACCOUNT_SID",  "")
_TWILIO_TOKEN = os.getenv("TWILIO_AUTH_TOKEN",    "")
_TWILIO_FROM  = os.getenv("TWILIO_FROM_NUMBER",   "")

# ─── Fixed welcome message ────────────────────────────────────────────────────
WELCOME_MESSAGE = "Welcome to AI Prescription System"


# ─── Twilio SMS sender (synchronous, called in thread pool) ───────────────────
def _send_sms_sync(to_phone: str, message: str) -> None:
    if not (_TWILIO_SID and _TWILIO_TOKEN and _TWILIO_FROM):
        log.warning(
            "[SMS] Twilio credentials not configured. "
            "Set NOTIFY_SMS_ENABLED=true and add Twilio keys in .env to enable SMS."
        )
        return

    try:
        import urllib.request
        import urllib.parse
        import base64
        import json

        url  = f"https://api.twilio.com/2010-04-01/Accounts/{_TWILIO_SID}/Messages.json"
        data = urllib.parse.urlencode({
            "To":   to_phone,
            "From": _TWILIO_FROM,
            "Body": message,
        }).encode()

        cred = base64.b64encode(f"{_TWILIO_SID}:{_TWILIO_TOKEN}".encode()).decode()
        req  = urllib.request.Request(
            url, data=data,
            headers={"Authorization": f"Basic {cred}"}
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read())
            log.info("[SMS] Sent to %s (SID: %s)", to_phone, result.get("sid"))

    except Exception as exc:
        log.error("[SMS] Delivery failed to %s: %s", to_phone, exc)


# ─── Public API ───────────────────────────────────────────────────────────────
async def send_login_notification(
    *,
    email: Optional[str],
    phone: Optional[str],
    full_name: str,
    role: str,
    db=None,
) -> None:
    """
    Fires after every successful login.
    - Sends an SMS to `phone` if it is present and NOTIFY_SMS_ENABLED=true.
    - Logs the event to the `notifications` collection in MongoDB.
    - Email notifications are intentionally disabled.
    """
    now        = datetime.utcnow()
    loop       = asyncio.get_event_loop()
    sms_status = "disabled"

    # ── SMS ───────────────────────────────────────────────────────────────────
    if phone and phone.strip():
        normalized = phone.strip()
        # Auto-prefix with +91 for Indian numbers without country code
        if not normalized.startswith("+"):
            normalized = f"+91{normalized}"

        if _SMS_ENABLED:
            try:
                await loop.run_in_executor(
                    None, _send_sms_sync, normalized, WELCOME_MESSAGE
                )
                sms_status = "sent"
            except Exception as e:
                log.error("[SMS] Task error: %s", e)
                sms_status = "failed"
        else:
            log.info(
                "[SMS] Skipped (disabled). Would have sent '%s' to %s. "
                "Set NOTIFY_SMS_ENABLED=true in .env to enable.",
                WELCOME_MESSAGE, normalized
            )
            sms_status = "not_configured"
    else:
        log.info("[SMS] No phone number on record for user — SMS skipped.")
        sms_status = "no_phone"

    # ── DB log ────────────────────────────────────────────────────────────────
    if db is not None:
        try:
            await db["notifications"].insert_one({
                "type":       "login_welcome",
                "email":      email or "",
                "phone":      phone or "",
                "full_name":  full_name,
                "role":       role,
                "message":    WELCOME_MESSAGE,
                "login_at":   now,
                "sms_status": sms_status,
            })
        except Exception as e:
            log.warning("[SMS] Could not log notification to DB: %s", e)

import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Africa's Talking Setup (Environment config with local fallbacks) ---
AT_USERNAME = os.getenv("AT_USERNAME", "weenaloft")
AT_API_KEY = os.getenv("AT_API_KEY", "atsk_f6d2f7d5c4f1a9d1ebdea7158fdba5c9d5a1c0f3e8c79382482ebd2e05e7afc9221cd470")

try:
    import africastalking
    africastalking.initialize(AT_USERNAME, AT_API_KEY)
    sms = africastalking.SMS
    at_initialized = True
except Exception as e:
    logger.error(f"Failed to initialize Africa's Talking client: {e}")
    sms = None
    at_initialized = False

def format_phone_number(phone: str) -> str:
    """Ensure phone number is in international format (e.g. +254...)"""
    phone = phone.strip().replace(" ", "").replace("-", "")
    if phone.startswith("+"):
        return phone
    if phone.startswith("07") or phone.startswith("01"):
        return "+254" + phone[1:]
    if phone.startswith("254"):
        return "+" + phone
    if len(phone) == 9 and phone.isdigit():
        return "+254" + phone
    return phone

def send_sms(phone_number: str, message: str) -> bool:
    """Send an SMS message to a specific number via Africa's Talking."""
    if not at_initialized or not sms:
        logger.warning(f"SMS client not initialized. Skipped sending message to: {phone_number}")
        return False
        
    formatted_number = format_phone_number(phone_number)
    try:
        response = sms.send(message, [formatted_number])
        logger.info(f"AT SMS Response: {response}")
        return True
    except Exception as e:
        logger.error(f"Failed to send SMS to {formatted_number}: {e}")
        return False

def send_whatsapp(phone_number: str, message: str) -> bool:
    """Mock WhatsApp function (User opted for manual dashboard queue instead)."""
    logger.info(f"Mock WhatsApp message queued for {phone_number}: {message[:30]}...")
    return True

def send_admin_report(admin_phone: str, count: int, date_type: str) -> bool:
    """Send a confirmation message to the admin that automated messages went out."""
    message = f"SYSTEM REPORT: Automated {date_type} SMS reminders have been successfully dispatched to {count} active tenants."
    return send_sms(admin_phone, message)

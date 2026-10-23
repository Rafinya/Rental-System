from fastapi import FastAPI, HTTPException, Request, status, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import datetime
import calendar
import re
import os
import sys

# Load .env file manually at startup to avoid external dependencies
if os.path.exists(".env"):
    with open(".env", "r") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                try:
                    key, val = line.split("=", 1)
                    # Strip quotes if present
                    val = val.strip().strip("'").strip('"')
                    os.environ[key.strip()] = val
                except Exception as e:
                    print(f"Error parsing line in .env: {line}. Error: {e}")

from database import (
    init_db, get_units, get_tenants, add_tenant, delete_tenant,
    get_payments, add_payment, get_repairs, add_repair,
    update_repair_status, get_reminders, add_reminder, get_owner, update_owner,
    update_tenant_arrears, verify_password, hash_password, create_session,
    get_session, delete_session
)

from apscheduler.schedulers.background import BackgroundScheduler
import messaging

app = FastAPI(title="Weena Loft — Premium Rental Engine", version="2.0.0")

# Setup CORS with customizable origins from environment
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cross-platform file locking for APScheduler process safety
class ProcessLock:
    def __init__(self, lockfile="scheduler.lock"):
        self.lockfile = lockfile
        self.fp = None

    def acquire(self) -> bool:
        try:
            if sys.platform == 'win32':
                import msvcrt
                self.fp = open(self.lockfile, 'w')
                msvcrt.locking(self.fp.fileno(), msvcrt.LK_NBLCK, 1)
            else:
                import fcntl
                self.fp = open(self.lockfile, 'w')
                fcntl.flock(self.fp.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
            return True
        except Exception:
            if self.fp:
                try:
                    self.fp.close()
                except:
                    pass
            return False

    def release(self):
        if self.fp:
            try:
                self.fp.close()
                if os.path.exists(self.lockfile):
                    os.remove(self.lockfile)
            except:
                pass

scheduler_lock = ProcessLock()

# Automated Reminder Jobs
def trigger_1st_reminders():
    try:
        tenants = get_tenants()
        count = 0
        landlords = os.getenv("LANDLORDS", "Osanya F and Osiko R")
        bank_name = os.getenv("BANK_NAME", "Absa Bank Queensway")
        bank_acc = os.getenv("BANK_ACC", "2053 9252 54")
        paybill = os.getenv("PAYBILL", "303030")
        ops_phone = os.getenv("OPS_PHONE", "0712522925")

        for t in tenants:
            if t["status"] == "Active":
                message = (f"Dear {t['first_name']}, please note your rent payment bank details for Weena Loft:\n"
                           f"Landlords: {landlords}\n"
                           f"Bank: {bank_name}\n"
                           f"Acc. {bank_acc}\n"
                           f"Paybill: {paybill}\n"
                           f"Rent: KES {t['rent']:,.2f}\n"
                           f"Pay via Paybill to Bank only. No direct Send Money. Thank you!\n\n"
                           f"For any Inquiries, contact Operations manager: {ops_phone}")
                # Send both SMS and WhatsApp
                messaging.send_sms(t["phone"], message)
                messaging.send_whatsapp(t["whatsapp"], message)
                count += 1
                
        messaging.send_admin_report(ops_phone, count, "1st of the month")
    except Exception as e:
        print(f"Error during 1st reminders job: {e}")

def trigger_7th_reminders():
    try:
        tenants = get_tenants()
        count = 0
        ops_phone = os.getenv("OPS_PHONE", "0712522925")
        for t in tenants:
            if t["status"] == "Active":
                message = (f"Dear {t['first_name']}, a polite reminder that rent is due by the 10th. "
                           f"Please note that after the 10th, a 5% late fee will be added to the rent cost. Thank you!")
                # Send both SMS and WhatsApp
                messaging.send_sms(t["phone"], message)
                messaging.send_whatsapp(t["whatsapp"], message)
                count += 1
                
        messaging.send_admin_report(ops_phone, count, "7th of the month")
    except Exception as e:
        print(f"Error during 7th reminders job: {e}")

# Startup DB & Scheduler Init
@app.on_event("startup")
def startup_event():
    init_db()
    if scheduler_lock.acquire():
        print("Acquired scheduler lock. Starting BackgroundScheduler...")
        scheduler = BackgroundScheduler()
        # Run at 9:00 AM on the 1st day of every month
        scheduler.add_job(trigger_1st_reminders, 'cron', day=1, hour=9, minute=0)
        # Run at 9:00 AM on the 7th day of every month
        scheduler.add_job(trigger_7th_reminders, 'cron', day=7, hour=9, minute=0)
        scheduler.start()
        app.state.scheduler = scheduler
    else:
        print("Scheduler lock busy. Scheduler already running in another process.")

@app.on_event("shutdown")
def shutdown_event():
    if hasattr(app.state, "scheduler"):
        print("Shutting down scheduler...")
        app.state.scheduler.shutdown()
    scheduler_lock.release()

# Token Authentication Dependency
def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header. Please log in."
        )
    token = authorization.split(" ")[1]
    session = get_session(token)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or is invalid. Please log in again."
        )
    return session

# Request Validation Models
class LoginRequest(BaseModel):
    username: str
    password: str

class TenantCreate(BaseModel):
    unit_id: str
    first_name: str
    last_name: str
    phone: str
    whatsapp: str
    email: str
    move_in_date: str

class PaymentCreate(BaseModel):
    tenant_id: int
    unit_id: str
    amount_paid: float
    payment_month: str
    payment_date: str
    late_fee: float
    reference: str
    status: str

class RepairCreate(BaseModel):
    unit_id: Optional[str] = None
    description: str
    cost: float
    priority: str

class RepairStatusUpdate(BaseModel):
    status: str

class ArrearsUpdate(BaseModel):
    arrears: float

class OwnerUpdate(BaseModel):
    username: str
    name: str
    phone: str
    email: str
    avatar: str
    password: Optional[str] = None

# Custom Exception Handler to prevent SQL / system leaks
def handle_route_exception(e: Exception):
    detail = str(e)
    if "sqlite3" in detail or "UNIQUE constraint" in detail:
        detail = "A database integrity error occurred. Please check input parameters."
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=detail
    )

# 1. Authentication
@app.post("/api/auth/login")
def login(req: LoginRequest):
    username = req.username.strip().lower()
    owner = get_owner(username)
    if not owner or not verify_password(owner["password"], req.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Create secure session token
    token = create_session(username)
    return {
        "status": "success",
        "username": owner["username"],
        "name": owner["name"],
        "role": owner["role"],
        "phone": owner["phone"],
        "email": owner["email"],
        "avatar": owner["avatar"],
        "token": token
    }

@app.post("/api/auth/logout")
def logout(authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        delete_session(token)
    return {"status": "success"}

# 2. Dashboard Statistics
@app.get("/api/dashboard/stats")
def get_stats(current_user: dict = Depends(get_current_user)):
    try:
        units = get_units()
        tenants = get_tenants()
        payments = get_payments()
        repairs = get_repairs()
        
        total_expected = sum(u["rent"] for u in units)
        
        # Calculate collections for current month
        today = datetime.date.today()
        current_month_str = today.strftime("%Y-%m") # YYYY-MM
        
        total_collected = 0.0
        for p in payments:
            if p["payment_month"] == current_month_str and p["status"] == "Cleared":
                total_collected += p["amount_paid"]
                
        # Calculate occupancy
        occupied_count = sum(1 for u in units if u["status"] == "Occupied")
        vacant_count = len(units) - occupied_count
        
        # Arrears calculations (sum of all dynamic tenant arrears)
        arrears = sum(tenant.get("arrears", 0.0) for tenant in tenants)
                
        # Repairs calculations
        pending_repairs = sum(1 for r in repairs if r["status"] != "Completed")
        total_repair_costs = sum(r["cost"] for r in repairs if r["status"] == "Completed")
        
        # Tax due (7.5% of expected monthly rent, reset to 0 if marked Paid)
        from database import get_tax_status
        tax_status = get_tax_status(current_month_str)
        if tax_status == "Paid":
            tax_due = 0.0
        else:
            tax_due = total_expected * 0.075
        
        # Fetch recent payments (up to 5)
        recent_payments = payments[:5]
        
        return {
            "total_collected": total_collected,
            "total_expected": total_expected,
            "occupied_units": occupied_count,
            "vacant_units": vacant_count,
            "active_tenants_count": len(tenants),
            "arrears": arrears,
            "pending_repairs": pending_repairs,
            "total_repair_costs": total_repair_costs,
            "tax_due": tax_due,
            "tax_status": tax_status,
            "current_month": current_month_str,
            "recent_payments": recent_payments
        }
    except Exception as e:
        handle_route_exception(e)

@app.post("/api/dashboard/mark-tax-paid")
def mark_tax_paid_endpoint(current_user: dict = Depends(get_current_user)):
    try:
        from database import set_tax_status
        current_month = datetime.date.today().strftime("%Y-%m")
        set_tax_status(current_month, 'Paid')
        return {"status": "success"}
    except Exception as e:
        handle_route_exception(e)

# 3. Units API
@app.get("/api/units")
def get_all_units(current_user: dict = Depends(get_current_user)):
    return get_units()

# 4. Tenants API
@app.get("/api/tenants")
def get_all_tenants(current_user: dict = Depends(get_current_user)):
    return get_tenants()

@app.post("/api/tenants")
def create_tenant(req: TenantCreate, current_user: dict = Depends(get_current_user)):
    try:
        add_tenant(
            req.unit_id, req.first_name, req.last_name,
            req.phone, req.whatsapp, req.email, req.move_in_date
        )
        return {"status": "success"}
    except Exception as e:
        handle_route_exception(e)

@app.delete("/api/tenants/{id}")
def remove_tenant(id: int, current_user: dict = Depends(get_current_user)):
    try:
        delete_tenant(id)
        return {"status": "success"}
    except Exception as e:
        handle_route_exception(e)

@app.put("/api/tenants/{id}/arrears")
def update_arrears(id: int, req: ArrearsUpdate, current_user: dict = Depends(get_current_user)):
    try:
        update_tenant_arrears(id, req.arrears)
        return {"status": "success"}
    except Exception as e:
        handle_route_exception(e)

# 5. Payments API
@app.get("/api/payments")
def get_all_payments(current_user: dict = Depends(get_current_user)):
    return get_payments()

@app.post("/api/payments")
def create_payment(req: PaymentCreate, current_user: dict = Depends(get_current_user)):
    try:
        add_payment(
            req.tenant_id, req.unit_id, req.amount_paid,
            req.payment_month, req.payment_date, req.late_fee,
            req.reference, req.status
        )
        return {"status": "success"}
    except Exception as e:
        handle_route_exception(e)

@app.put("/api/payments/{id}")
def edit_payment(id: int, req: PaymentCreate, current_user: dict = Depends(get_current_user)):
    try:
        from database import update_payment
        update_payment(
            id, req.tenant_id, req.unit_id, req.amount_paid,
            req.payment_month, req.payment_date, req.late_fee,
            req.reference, req.status
        )
        return {"status": "success"}
    except Exception as e:
        handle_route_exception(e)

@app.delete("/api/payments/{id}")
def remove_payment(id: int, current_user: dict = Depends(get_current_user)):
    try:
        from database import delete_payment
        delete_payment(id)
        return {"status": "success"}
    except Exception as e:
        handle_route_exception(e)

@app.post("/api/payments/sms-webhook")
def sms_webhook(req: dict, token: Optional[str] = None):
    # Webhook secure token check
    expected_token = os.getenv("SMS_WEBHOOK_TOKEN")
    if expected_token and token != expected_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized SMS webhook call."
        )

    message = req.get("message", "")
    
    # Split message if forwarded with a divider separator
    if "************" in message:
        parts = message.split("************")
        message = parts[-1].strip()
    
    # Try Format A: received KES15000.0 MPESA ref: UH5JQ17T2D
    match_a = re.search(r"received\s+KES\s*([\d,]+\.?\d*)\s+MPESA\s+ref:\s*([A-Z0-9]+)\s+to\s+(?:your\s+)?account\s+XX5254\s+from\s+([A-Za-z\s]+)", message, re.IGNORECASE)
    
    # Try Format B: Deposited KES15000.0 MPESA ref: ...
    match_b = re.search(r"Dear\s+([A-Za-z\s]+),\s+You\s+have\s+deposited\s+KES\s*([\d,]+\.?\d*)\s+MPESA\s+ref:\s*([A-Z0-9]+)\s+to\s+account\s+XX5254", message, re.IGNORECASE)
    
    # Try Format C: Credit has been made for KES15000
    match_c = re.search(r"Credit\s+has\s+been\s+made\s+for\s+KES\s*([\d,]+\.?\d*)\s+on\s+your\s+Account\s+XX5254", message, re.IGNORECASE)
    
    ref = ""
    amount = 0.0
    tenant_name_raw = ""
    
    if match_a:
        amount = float(match_a.group(1).replace(",", ""))
        ref = match_a.group(2).upper()
        tenant_name_raw = match_a.group(3).strip()
    elif match_b:
        tenant_name_raw = match_b.group(1).strip()
        amount = float(match_b.group(2).replace(",", ""))
        ref = match_b.group(3).upper()
    elif match_c:
        amount = float(match_c.group(1).replace(",", ""))
        # Generate a unique reference with timestamp and random string to secure idempotency for Format C
        import secrets
        ref = f"BANK-DEP-{int(datetime.datetime.now().timestamp())}-{secrets.token_hex(4).upper()}"
        tenant_name_raw = "Unknown Depositor (Direct Bank Transfer)"
    else:
        raise HTTPException(status_code=400, detail="Invalid SMS format. Expected Absa deposit notification pattern.")
        
    tenants = get_tenants()
    matched_tenant = None
    
    # Tenant name matching logic
    if tenant_name_raw != "Unknown Depositor (Direct Bank Transfer)":
        for t in tenants:
            if t["status"] == "Active":
                full_name = f"{t['first_name']} {t['last_name']}".lower()
                first_name = t['first_name'].lower()
                raw_lower = tenant_name_raw.lower()
                if first_name in raw_lower or full_name in raw_lower:
                    matched_tenant = t
                    break
                    
    if not matched_tenant:
        return {
            "status": "manual_review_required",
            "message": "Payment logged but tenant name could not be automatically matched.",
            "amount": amount,
            "reference": ref,
            "raw_name": tenant_name_raw
        }
        
    # Late fee check (5% if paid after 10th of current month)
    today = datetime.date.today()
    payment_month = today.strftime("%Y-%m")
    payment_date = today.strftime("%Y-%m-%d")
    
    late_fee = 0.0
    if today.day > 10:
        late_fee = matched_tenant["rent"] * 0.05
        
    try:
        add_payment(
            tenant_id=matched_tenant["id"],
            unit_id=matched_tenant["unit_id"],
            amount_paid=amount,
            payment_month=payment_month,
            payment_date=payment_date,
            late_fee=late_fee,
            reference=ref,
            status="Cleared"
        )
        return {
            "status": "success",
            "tenant": f"{matched_tenant['first_name']} {matched_tenant['last_name']}",
            "amount": amount,
            "reference": ref
        }
    except Exception as e:
        handle_route_exception(e)

# 6. Repairs API
@app.get("/api/repairs")
def get_all_repairs(current_user: dict = Depends(get_current_user)):
    return get_repairs()

@app.post("/api/repairs")
def create_repair(req: RepairCreate, current_user: dict = Depends(get_current_user)):
    try:
        today = datetime.date.today().strftime("%Y-%m-%d")
        add_repair(
            req.unit_id, req.description, req.cost,
            req.priority, today
        )
        return {"status": "success"}
    except Exception as e:
        handle_route_exception(e)

@app.put("/api/repairs/{id}/status")
def update_repair(id: int, req: RepairStatusUpdate, current_user: dict = Depends(get_current_user)):
    try:
        update_repair_status(id, req.status)
        return {"status": "success"}
    except Exception as e:
        handle_route_exception(e)

# 7. Reminders & Broadcast APIs
@app.get("/api/reminders")
def get_all_reminders_route(current_user: dict = Depends(get_current_user)):
    return get_reminders()

@app.post("/api/reminders/send-rent-reminders")
def send_rent_reminders(current_user: dict = Depends(get_current_user)):
    try:
        today = datetime.date.today()
        today_str = today.strftime("%Y-%m-%d")
        month_name = calendar.month_name[today.month]
        tenants = get_tenants()
        
        bank_name = os.getenv("BANK_NAME", "Absa Bank Queensway")
        bank_acc = os.getenv("BANK_ACC", "2053 9252 54")
        paybill = os.getenv("PAYBILL", "303030")

        sent_count = 0
        for t in tenants:
            msg = (
                f"Dear {t['first_name']} {t['last_name']},\n"
                f"Please remember to bank your {month_name} rent of KES {t['rent']:,} "
                f"on or before the 7th. {bank_name} Acc: {bank_acc}, Paybill: {paybill}. "
                f"Note: Rent paid after the 10th incurs a 5% late fee. Thank you."
            )
            try:
                add_reminder("rent_notice", f"{t['first_name']} {t['last_name']}", t["phone"], msg, today_str)
                sent_count += 1
            except Exception:
                pass
                
        return {"status": "success", "reminders_sent": sent_count}
    except Exception as e:
        handle_route_exception(e)

@app.post("/api/reminders/send-tax-reminders")
def send_tax_reminders(current_user: dict = Depends(get_current_user)):
    try:
        today = datetime.date.today()
        today_str = today.strftime("%Y-%m-%d")
        
        # Calculate tax based on actual cleared monthly collections
        payments = get_payments()
        current_month_str = today.strftime("%Y-%m")
        
        total_collected = 0.0
        for p in payments:
            if p["payment_month"] == current_month_str and p["status"] == "Cleared":
                total_collected += p["amount_paid"]
                
        tax_due = total_collected * 0.075
        
        owners = [get_owner("florence"), get_owner("ralph")]
        sent_count = 0
        
        for owner in owners:
            if not owner:
                continue
            msg = (
                f"Hi {owner['name']},\n"
                f"This is a reminder that the 7.5% monthly rental income tax of "
                f"KES {tax_due:,.2f} on collections of KES {total_collected:,.2f} is due by the 10th. "
                f"Please file your KRA returns on time."
            )
            try:
                add_reminder("tax_alert", owner["name"], owner["phone"], msg, today_str)
                sent_count += 1
            except Exception:
                pass
                
        return {"status": "success", "reminders_sent": sent_count}
    except Exception as e:
        handle_route_exception(e)

@app.post("/api/reminders/send-tenant-info")
def send_tenant_info_broadcast(current_user: dict = Depends(get_current_user)):
    try:
        today = datetime.date.today()
        today_str = today.strftime("%Y-%m-%d")
        tenants = get_tenants()
        
        landlords = os.getenv("LANDLORDS", "Osanya F and Osiko R")
        bank_name = os.getenv("BANK_NAME", "Absa Bank Queensway")
        bank_acc = os.getenv("BANK_ACC", "2053 9252 54")
        paybill = os.getenv("PAYBILL", "303030")

        sent_count = 0
        for t in tenants:
            msg = (
                f"Dear {t['first_name']} {t['last_name']},\n"
                f"Please note your rent payment bank details for Weena Loft:\n"
                f"Landlords: {landlords}\n"
                f"Bank: {bank_name}\n"
                f"Acc. {bank_acc}\n"
                f"Paybill: {paybill}\n"
                f"NOTE: We need money banked, no M-Pesa payments directly to phone numbers. Thank you."
            )
            try:
                add_reminder("bank_info", f"{t['first_name']} {t['last_name']}", t["phone"], msg, today_str)
                sent_count += 1
            except Exception:
                pass
                
        return {"status": "success", "reminders_sent": sent_count}
    except Exception as e:
        handle_route_exception(e)

# 8. Owners API
@app.get("/api/owners/{username}")
def get_owner_profile(username: str, current_user: dict = Depends(get_current_user)):
    owner = get_owner(username)
    if not owner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Owner profile not found"
        )
    return {
        "username": owner["username"],
        "name": owner["name"],
        "phone": owner["phone"],
        "email": owner["email"],
        "role": owner["role"],
        "avatar": owner["avatar"]
    }

@app.put("/api/owners/{username}")
def update_owner_profile(username: str, req: OwnerUpdate, current_user: dict = Depends(get_current_user)):
    success, err_msg = update_owner(
        username, req.username, req.name,
        req.phone, req.email, req.avatar,
        password=req.password
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=err_msg or "Failed to update profile"
        )
    return {"status": "success"}

# Serve static folder
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/documentation")
def read_documentation():
    return FileResponse("static/documentation.html")

@app.get("/{path:path}")
def serve_index(path: str):
    return FileResponse("static/index.html")

# --- Testing Endpoints for Automated Messages ---
@app.post("/api/reminders/send-1st")
def test_send_1st_reminders(current_user: dict = Depends(get_current_user)):
    trigger_1st_reminders()
    return {"status": "success", "message": "1st of month reminders triggered"}

@app.post("/api/reminders/send-7th")
def test_send_7th_reminders(current_user: dict = Depends(get_current_user)):
    trigger_7th_reminders()
    return {"status": "success", "message": "7th of month reminders triggered"}

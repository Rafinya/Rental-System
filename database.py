import sqlite3
import os
import hashlib
import secrets
import datetime
from typing import Optional

DB_FILE = "rental_system.db"

def hash_password(password: str) -> str:
    """Hash password using PBKDF2 with HMAC-SHA256 (safe and built-in)"""
    salt = secrets.token_bytes(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return f"{salt.hex()}:{key.hex()}"

def verify_password(stored_password_hash: str, password: str) -> bool:
    """Verify password against a stored PBKDF2 hash"""
    try:
        salt_hex, key_hex = stored_password_hash.split(':')
        salt = bytes.fromhex(salt_hex)
        key = bytes.fromhex(key_hex)
        new_key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
        return secrets.compare_digest(key, new_key)
    except Exception:
        return False

def create_session(username: str) -> str:
    """Create a new session token that expires in 7 days"""
    token = secrets.token_hex(32)
    expires_at = (datetime.datetime.now() + datetime.timedelta(days=7)).isoformat()
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO sessions (token, username, expires_at) VALUES (?, ?, ?)", (token, username.lower(), expires_at))
        conn.commit()
    finally:
        conn.close()
    return token

def get_session(token: str) -> Optional[dict]:
    """Retrieve session details and verify expiration"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT s.token, s.username, s.expires_at, o.name, o.role, o.phone, o.email, o.avatar 
            FROM sessions s 
            JOIN owners o ON s.username = o.username 
            WHERE s.token = ?
        """, (token,))
        row = cursor.fetchone()
        if not row:
            return None
        
        expires_at = datetime.datetime.fromisoformat(row["expires_at"])
        if datetime.datetime.now() > expires_at:
            # Expired, clean up
            cursor.execute("DELETE FROM sessions WHERE token = ?", (token,))
            conn.commit()
            return None
            
        return {
            "token": row["token"],
            "username": row["username"],
            "name": row["name"],
            "role": row["role"],
            "phone": row["phone"],
            "email": row["email"],
            "avatar": row["avatar"] or ""
        }
    finally:
        conn.close()

def delete_session(token: str):
    """Delete a session on logout"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM sessions WHERE token = ?", (token,))
        conn.commit()
    finally:
        conn.close()

def get_db_connection():
    """Get SQLite connection with Row factory and Foreign Keys enabled"""
    conn = sqlite3.connect(DB_FILE)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    # Create tables
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS units (
        id TEXT PRIMARY KEY,
        rent INTEGER NOT NULL,
        side TEXT NOT NULL,
        status TEXT DEFAULT 'Vacant'
    );
    """)
    
    # Safe migration: Check if tenants table exists and has a UNIQUE constraint on unit_id
    cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='tenants'")
    tenants_sql_row = cursor.fetchone()
    if tenants_sql_row:
        tenants_sql = tenants_sql_row[0]
        if "UNIQUE" in tenants_sql and "unit_id" in tenants_sql:
            # Table has a UNIQUE constraint on unit_id, we need to drop/recreate to support history
            cursor.execute("ALTER TABLE tenants RENAME TO tenants_old;")
            
            cursor.execute("""
            CREATE TABLE tenants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                unit_id TEXT,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                phone TEXT NOT NULL,
                whatsapp TEXT NOT NULL,
                email TEXT NOT NULL,
                move_in_date TEXT NOT NULL,
                arrears REAL DEFAULT 0,
                status TEXT DEFAULT 'Active',
                rent INTEGER,
                FOREIGN KEY (unit_id) REFERENCES units(id)
            );
            """)
            
            cursor.execute("""
            INSERT INTO tenants (id, unit_id, first_name, last_name, phone, whatsapp, email, move_in_date, arrears, status)
            SELECT id, unit_id, first_name, last_name, phone, whatsapp, email, move_in_date, arrears, status
            FROM tenants_old;
            """)
            
            cursor.execute("DROP TABLE tenants_old;")
            conn.commit()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tenants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        unit_id TEXT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        whatsapp TEXT NOT NULL,
        email TEXT NOT NULL,
        move_in_date TEXT NOT NULL,
        arrears REAL DEFAULT 0,
        status TEXT DEFAULT 'Active',
        rent INTEGER,
        FOREIGN KEY (unit_id) REFERENCES units(id)
    );
    """)

    # Check if rent column is missing in tenants table (for safety)
    try:
        cursor.execute("ALTER TABLE tenants ADD COLUMN rent INTEGER")
        conn.commit()
    except sqlite3.OperationalError:
        pass  # Column already exists
    
    # Populate tenant rent from unit rent for any missing records
    cursor.execute("""
    UPDATE tenants 
    SET rent = (SELECT rent FROM units WHERE units.id = tenants.unit_id)
    WHERE rent IS NULL AND unit_id IS NOT NULL;
    """)
    conn.commit()
    
    # Safe migration: Check if payments table exists and lacks UNIQUE constraint on reference
    cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='payments'")
    payments_sql_row = cursor.fetchone()
    if payments_sql_row:
        payments_sql = payments_sql_row[0]
        if "UNIQUE" not in payments_sql or "reference" not in payments_sql:
            cursor.execute("ALTER TABLE payments RENAME TO payments_old;")
            
            cursor.execute("""
            CREATE TABLE payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tenant_id INTEGER NOT NULL,
                unit_id TEXT NOT NULL,
                amount_paid REAL NOT NULL,
                payment_month TEXT NOT NULL,
                payment_date TEXT NOT NULL,
                late_fee REAL DEFAULT 0,
                reference TEXT NOT NULL UNIQUE,
                status TEXT NOT NULL,
                FOREIGN KEY (tenant_id) REFERENCES tenants(id),
                FOREIGN KEY (unit_id) REFERENCES units(id)
            );
            """)
            
            cursor.execute("""
            INSERT OR IGNORE INTO payments (id, tenant_id, unit_id, amount_paid, payment_month, payment_date, late_fee, reference, status)
            SELECT id, tenant_id, unit_id, amount_paid, payment_month, payment_date, late_fee, reference, status
            FROM payments_old;
            """)
            
            cursor.execute("DROP TABLE payments_old;")
            conn.commit()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER NOT NULL,
        unit_id TEXT NOT NULL,
        amount_paid REAL NOT NULL,
        payment_month TEXT NOT NULL,
        payment_date TEXT NOT NULL,
        late_fee REAL DEFAULT 0,
        reference TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id),
        FOREIGN KEY (unit_id) REFERENCES units(id)
    );
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS repairs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        unit_id TEXT,
        description TEXT NOT NULL,
        cost REAL NOT NULL,
        priority TEXT NOT NULL,
        status TEXT DEFAULT 'Reported',
        date_logged TEXT NOT NULL,
        FOREIGN KEY (unit_id) REFERENCES units(id)
    );
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        recipient_name TEXT NOT NULL,
        contact TEXT NOT NULL,
        message TEXT NOT NULL,
        schedule_date TEXT NOT NULL,
        status TEXT DEFAULT 'Scheduled'
    );
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS owners (
        username TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL,
        avatar TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        FOREIGN KEY (username) REFERENCES owners(username)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tax_status (
        month TEXT PRIMARY KEY,
        status TEXT NOT NULL DEFAULT 'Unpaid'
    );
    """)
    
    # Seed units
    cursor.execute("SELECT COUNT(*) FROM units")
    if cursor.fetchone()[0] == 0:
        units_seed = [
            ("F1", 14000, "F Side"),
            ("F2", 14000, "F Side"),
            ("F3", 13000, "F Side"),
            ("F4", 13000, "F Side"),
            ("M1", 15000, "M Side"),
            ("M2", 17000, "M Side"),
            ("M3", 14000, "M Side"),
            ("M4", 17000, "M Side"),
            ("M5", 12000, "M Side"),
            ("Fs", 7000, "Shop"),
            ("Watchman", 3000, "Small Room"),
            ("Double (SRD)", 5000, "Small Room"),
            ("SRS", 4000, "Small Room"),
            ("SRB", 5000, "Small Room")
        ]
        cursor.executemany("INSERT INTO units (id, rent, side, status) VALUES (?, ?, ?, 'Vacant')", units_seed)
        
    # Seed owners with HASHED passwords
    cursor.execute("SELECT COUNT(*) FROM owners")
    if cursor.fetchone()[0] == 0:
        owners_seed = [
            ("florence", hash_password("Ralphedd@123"), "Florence Osanya", "0721470131", "florence@weenaloft.com", "Main Owner", ""),
            ("ralph", hash_password("Ralphedd@123"), "Ralph Osiko", "0712522925", "ralph@weenaloft.com", "Owner", "")
        ]
        cursor.executemany("INSERT INTO owners (username, password, name, phone, email, role, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)", owners_seed)
    else:
        # Migrate existing plaintext passwords in database
        cursor.execute("SELECT username, password FROM owners")
        for r in cursor.fetchall():
            uname = r["username"]
            pwd = r["password"]
            if ":" not in pwd:  # Plaintext password
                cursor.execute("UPDATE owners SET password = ? WHERE username = ?", (hash_password(pwd), uname))
        
    # Sync static unit status column with active tenants
    cursor.execute("UPDATE units SET status = 'Vacant'")
    cursor.execute("""
        UPDATE units 
        SET status = 'Occupied' 
        WHERE id IN (SELECT unit_id FROM tenants WHERE status = 'Active')
    """)
        
    conn.commit()
    conn.close()

# Helper access queries (all wrapped in try/finally to prevent connection leaks)
def get_units():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT u.id, u.rent, u.side, u.status, t.first_name || ' ' || t.last_name AS tenant_name, t.id AS tenant_id 
            FROM units u 
            LEFT JOIN tenants t ON u.id = t.unit_id AND t.status = 'Active'
        """)
        rows = cursor.fetchall()
        units_list = []
        for r in rows:
            has_tenant = bool(r["tenant_id"])
            dynamic_status = "Occupied" if has_tenant else "Vacant"
            units_list.append({
                "id": r["id"],
                "rent": r["rent"],
                "side": r["side"],
                "status": dynamic_status,
                "tenant_name": r["tenant_name"] if r["tenant_name"] else "",
                "tenant_id": r["tenant_id"] if r["tenant_id"] else 0
            })
        return units_list
    finally:
        conn.close()

def get_tenants():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT t.id, t.unit_id, t.first_name, t.last_name, t.phone, t.whatsapp, t.email, t.move_in_date, t.status, t.arrears, t.rent 
            FROM tenants t 
            WHERE t.status = 'Active'
        """)
        rows = cursor.fetchall()
        
        # Fetch all cleared payments
        cursor.execute("SELECT tenant_id, amount_paid FROM payments WHERE status = 'Cleared'")
        payments = cursor.fetchall()
        payments_by_tenant = {}
        for p in payments:
            tid = p["tenant_id"]
            payments_by_tenant[tid] = payments_by_tenant.get(tid, 0.0) + p["amount_paid"]
            
        today = datetime.date.today()
        
        tenants_list = []
        for r in rows:
            tid = r["id"]
            move_in_str = r["move_in_date"]
            rent = r["rent"] or 0
            starting_arrears = r["arrears"] or 0.0
            
            # Base month is max(August 2026, move_in_date)
            start_year = 2026
            start_month = 8
            try:
                parts = move_in_str.split('-')
                move_in_year = int(parts[0])
                move_in_month = int(parts[1])
                if move_in_year > start_year or (move_in_year == start_year and move_in_month > start_month):
                    start_year = move_in_year
                    start_month = move_in_month
            except:
                pass
                
            months_owed = (today.year - start_year) * 12 + (today.month - start_month) + 1
            months_owed = max(1, months_owed)
            
            total_expected = starting_arrears + (months_owed * rent)
            total_paid = payments_by_tenant.get(tid, 0.0)
            
            # Dynamic arrears calculation (removed clamping to allow negative balances/credits)
            dynamic_arrears = total_expected - total_paid
            
            tenants_list.append({
                "id": r["id"],
                "unit_id": r["unit_id"],
                "first_name": r["first_name"],
                "last_name": r["last_name"],
                "phone": r["phone"],
                "whatsapp": r["whatsapp"],
                "email": r["email"],
                "move_in_date": r["move_in_date"],
                "status": r["status"],
                "arrears": dynamic_arrears,
                "rent": rent
            })
        return tenants_list
    finally:
        conn.close()

def add_tenant(unit_id, first_name, last_name, phone, whatsapp, email, move_in_date):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Check if there is already an active tenant in this unit
        cursor.execute("SELECT id FROM tenants WHERE unit_id = ? AND status = 'Active'", (unit_id,))
        if cursor.fetchone():
            raise Exception(f"Unit {unit_id} already has an active tenant.")

        # Get the current rent of the unit to lock it in
        cursor.execute("SELECT rent FROM units WHERE id = ?", (unit_id,))
        unit_row = cursor.fetchone()
        rent = unit_row["rent"] if unit_row else 0

        cursor.execute("""
            INSERT INTO tenants (unit_id, first_name, last_name, phone, whatsapp, email, move_in_date, status, rent)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Active', ?)
        """, (unit_id, first_name, last_name, phone, whatsapp, email, move_in_date, rent))
        cursor.execute("UPDATE units SET status = 'Occupied' WHERE id = ?", (unit_id,))
        conn.commit()
    finally:
        conn.close()

def update_tenant_arrears(tenant_id, target_arrears):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT move_in_date, rent FROM tenants WHERE id = ?", (tenant_id,))
        t = cursor.fetchone()
        if not t:
            return
            
        rent = t["rent"] or 0
        
        cursor.execute("SELECT SUM(amount_paid) FROM payments WHERE tenant_id = ? AND status = 'Cleared'", (tenant_id,))
        total_paid_row = cursor.fetchone()
        total_paid = total_paid_row[0] or 0.0
        
        today = datetime.date.today()
        start_year = 2026
        start_month = 8
        try:
            parts = t["move_in_date"].split('-')
            move_in_year = int(parts[0])
            move_in_month = int(parts[1])
            if move_in_year > start_year or (move_in_year == start_year and move_in_month > start_month):
                start_year = move_in_year
                start_month = move_in_month
        except:
            pass
            
        months_owed = (today.year - start_year) * 12 + (today.month - start_month) + 1
        months_owed = max(1, months_owed)
        
        new_starting_arrears = target_arrears - (months_owed * rent) + total_paid
        
        cursor.execute("UPDATE tenants SET arrears = ? WHERE id = ?", (new_starting_arrears, tenant_id))
        conn.commit()
    finally:
        conn.close()

def delete_tenant(tenant_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT unit_id FROM tenants WHERE id = ?", (tenant_id,))
        row = cursor.fetchone()
        if row:
            unit_id = row["unit_id"]
            cursor.execute("UPDATE tenants SET status = 'Vacated' WHERE id = ?", (tenant_id,))
            cursor.execute("UPDATE units SET status = 'Vacant' WHERE id = ?", (unit_id,))
            conn.commit()
    finally:
        conn.close()

def get_payments():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT p.id, p.tenant_id, t.first_name || ' ' || t.last_name AS tenant_name, p.unit_id, p.amount_paid, p.payment_month, p.payment_date, p.late_fee, p.reference, p.status, u.rent AS expected_rent
            FROM payments p 
            JOIN tenants t ON p.tenant_id = t.id 
            JOIN units u ON p.unit_id = u.id
            ORDER BY p.payment_date DESC
        """)
        rows = cursor.fetchall()
        payments_list = []
        for r in rows:
            payments_list.append({
                "id": r["id"],
                "tenant_id": r["tenant_id"],
                "tenant_name": r["tenant_name"],
                "unit_id": r["unit_id"],
                "amount_paid": r["amount_paid"],
                "payment_month": r["payment_month"],
                "payment_date": r["payment_date"],
                "late_fee": r["late_fee"],
                "reference": r["reference"],
                "status": r["status"],
                "expected_rent": r["expected_rent"]
            })
        return payments_list
    finally:
        conn.close()

def add_payment(tenant_id, unit_id, amount_paid, payment_month, payment_date, late_fee, reference, status):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO payments (tenant_id, unit_id, amount_paid, payment_month, payment_date, late_fee, reference, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (tenant_id, unit_id, amount_paid, payment_month, payment_date, late_fee, reference, status))
        conn.commit()
    finally:
        conn.close()

def update_payment(payment_id, tenant_id, unit_id, amount_paid, payment_month, payment_date, late_fee, reference, status):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE payments 
            SET tenant_id = ?, unit_id = ?, amount_paid = ?, payment_month = ?, payment_date = ?, late_fee = ?, reference = ?, status = ?
            WHERE id = ?
        """, (tenant_id, unit_id, amount_paid, payment_month, payment_date, late_fee, reference, status, payment_id))
        conn.commit()
    finally:
        conn.close()

def delete_payment(payment_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM payments WHERE id = ?", (payment_id,))
        conn.commit()
    finally:
        conn.close()

def get_repairs():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, unit_id, description, cost, priority, status, date_logged FROM repairs ORDER BY date_logged DESC")
        rows = cursor.fetchall()
        repairs_list = []
        for r in rows:
            repairs_list.append({
                "id": r["id"],
                "unit_id": r["unit_id"] if r["unit_id"] else "",
                "description": r["description"],
                "cost": r["cost"],
                "priority": r["priority"],
                "status": r["status"],
                "date_logged": r["date_logged"]
            })
        return repairs_list
    finally:
        conn.close()

def add_repair(unit_id, description, cost, priority, date_logged):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO repairs (unit_id, description, cost, priority, status, date_logged)
            VALUES (?, ?, ?, ?, 'Reported', ?)
        """, (unit_id, description, cost, priority, date_logged))
        conn.commit()
    finally:
        conn.close()

def update_repair_status(repair_id, status):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE repairs SET status = ? WHERE id = ?", (status, repair_id))
        conn.commit()
    finally:
        conn.close()

def get_reminders():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, type, recipient_name, contact, message, schedule_date, status FROM reminders ORDER BY schedule_date DESC, id DESC")
        rows = cursor.fetchall()
        reminders_list = []
        for r in rows:
            reminders_list.append({
                "id": r["id"],
                "type": r["type"],
                "recipient_name": r["recipient_name"],
                "contact": r["contact"],
                "message": r["message"],
                "schedule_date": r["schedule_date"],
                "status": r["status"]
            })
        return reminders_list
    finally:
        conn.close()

def add_reminder(type, recipient_name, contact, message, schedule_date):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO reminders (type, recipient_name, contact, message, schedule_date, status)
            VALUES (?, ?, ?, ?, ?, 'Sent')
        """, (type, recipient_name, contact, message, schedule_date))
        conn.commit()
    finally:
        conn.close()

def get_owner(username):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT username, password, name, phone, email, role, COALESCE(avatar, '') AS avatar FROM owners WHERE username = ?", (username.lower(),))
        row = cursor.fetchone()
        owner = None
        if row:
            owner = {
                "username": row["username"],
                "password": row["password"],
                "name": row["name"],
                "phone": row["phone"],
                "email": row["email"],
                "role": row["role"],
                "avatar": row["avatar"]
            }
        return owner
    finally:
        conn.close()

def update_owner(old_username, new_username, name, phone, email, avatar, password=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # If username is changing, ensure new one is unique or belongs to this user
        if old_username.lower() != new_username.lower():
            cursor.execute("SELECT username FROM owners WHERE username = ?", (new_username.lower(),))
            if cursor.fetchone():
                return False, "Username already taken."
        
        if password:
            hashed_pwd = hash_password(password)
            cursor.execute("""
                UPDATE owners 
                SET username = ?, name = ?, phone = ?, email = ?, avatar = ?, password = ? 
                WHERE username = ?
            """, (new_username.lower(), name, phone, email, avatar, hashed_pwd, old_username.lower()))
        else:
            cursor.execute("""
                UPDATE owners 
                SET username = ?, name = ?, phone = ?, email = ?, avatar = ? 
                WHERE username = ?
            """, (new_username.lower(), name, phone, email, avatar, old_username.lower()))
        conn.commit()
        return True, None
    except sqlite3.Error as e:
        return False, str(e)
    finally:
        conn.close()

def get_tax_status(month: str) -> str:
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT status FROM tax_status WHERE month = ?", (month,))
        row = cursor.fetchone()
        if row:
            return row["status"]
        return "Unpaid"
    finally:
        conn.close()

def set_tax_status(month: str, status: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT OR REPLACE INTO tax_status (month, status) VALUES (?, ?)", (month, status))
        conn.commit()
    finally:
        conn.close()

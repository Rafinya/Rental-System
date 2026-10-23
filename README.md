# Weena Loft — Premium Rental Management Engine

Welcome to the **Weena Loft Rental Management Engine**, a custom-tailored, high-performance web platform designed specifically to streamline rental tracking, tax calculations, repair tickets, and automated reminder broadcasts for landlords **Florence Osanya** and **Ralph Osiko**.

---

## 🛠️ Tech Stack & Architecture

### Backend Core
* **Language**: Python 3.10+
* **Framework**: **FastAPI** — high-performance, asynchronous HTTP routing with auto-generated OpenAPI schemas.
* **Server**: **Uvicorn** — ASGI production server executing on port `8000`.
* **Database**: SQLite3 via standard `sqlite3` driver with foreign keys enforced.
* **Scheduling**: **APScheduler** — in-memory cron job runner synchronized using cross-platform file locking to guarantee process safety.

### Frontend Presentation
* **Structure**: Semantic HTML5 markup configured with `<div class="table-responsive">` boxes for layout flexibility.
* **Styling**: Vanilla CSS3 custom utility variables (`--primary`, `--bg-dark`, etc.), backdrop filters, smooth scaling cards, and media queries for responsive layouts.
* **Logic**: Vanilla ES6 Javascript utilizing native browser modules, dynamic DOM rendering, and Base64 uploader conversion models.
* **Fonts & Icons**: FontAwesome 6 (Free) for glyphs, Google Font **Outfit** for clean typography.

---

## 📂 Database Schema & Entity Relationship

The database runs migrations automatically upon boot and initializes seven relational tables:

```mermaid
erDiagram
    OWNERS {
        string username PK
        string password
        string name
        string phone
        string email
        string role
        string avatar
    }
    SESSIONS {
        string token PK
        string username FK
        string expires_at
    }
    UNITS {
        string id PK
        int rent
        string side
        string status
    }
    TENANTS {
        int id PK
        string unit_id FK
        string first_name
        string last_name
        string phone
        string whatsapp
        string email
        string move_in_date
        string status
        int rent
        real arrears
    }
    PAYMENTS {
        int id PK
        int tenant_id FK
        string unit_id FK
        real amount_paid
        string payment_month
        string payment_date
        real late_fee
        string reference UNIQUE
        string status
    }
    REPAIRS {
        int id PK
        string unit_id FK
        string description
        real cost
        string priority
        string status
        string date_logged
    }
    REMINDERS {
        int id PK
        string type
        string recipient_name
        string contact
        string message
        string schedule_date
        string status
    }

    OWNERS ||--o{ SESSIONS : "starts"
    UNITS ||--o{ TENANTS : "houses"
    TENANTS ||--o{ PAYMENTS : "makes"
    UNITS ||--o{ PAYMENTS : "assigned_to"
    UNITS ||--o{ REPAIRS : "incurs"
```

---

## 💼 Core Business Rules & Automation

The rental engine incorporates automated business logic matching Weena Loft operations:

### 1. Rent Collection Notice
* **Interval**: Rent is automatically scheduled for payment on the **1st** of every month and is marked due before the **7th**.
* **Overdue Late Fee (5%)**: If a tenant pays rent on or after the **11th** of the month, a 5% late surcharge is computed. *(e.g. paying KES 14,000 rent on the 12th prompts a warning of a KES 700 late fee).*

### 2. Landlord Monthly Tax Obligations (7.5%)
* **Interval**: A monthly rental income tax of 7.5% is paid on the **10th** of each month based on actual cleared monthly collections.
* **Owner Notifications**: SMS/Email tax notifications are generated and logged on the **9th** and **10th** to warn landlords Florence and Ralph.

### 3. Strict Banking Policy
* All tenant payment notifications contain explicit instructions to bank payments only at:
  * **Bank**: Absa Bank Queensway
  * **Account**: `2053 9252 54`
  * **Paybill**: `303030`
* Direct M-Pesa transfers to personal landlord mobile numbers are strictly prohibited.

---

## 🔑 Security & Session Validation
* **Password Hashing**: Passwords are securely hashed with a salt using the PBKDF2 standard with SHA256 (100,000 iterations), protecting credential integrity at rest.
* **Token Authentication**: Endpoints require a valid session bearer token (`Authorization: Bearer <token>`). Unauthenticated requests are rejected.
* **Webhooks Protection**: Webhook endpoints are protected by query/header token checks (defined via `SMS_WEBHOOK_TOKEN` in the environment).

---

## 📱 Mobile-First Features & Phone Viewing

The UI is built with a responsive CSS viewport layout:
* **Hamburger Menu**: On mobile, header nav links collapse into an overlay menu drawer toggled with a bars button.
* **Profile Drawer**: On phone views, the landlord avatar details and the **Log Out** button move inside the hamburger drawer to optimize workspace surface area.
* **Responsive Tables**: Long lists can be scrolled horizontally within cards without stretching the container.
* **Units Adaptive Grid**: The 14 units rearrange into a balanced double-column card layout on standard phone viewports.

### Testing on Your Mobile Phone
To view and operate the system from your phone:
1. Make sure your computer and your phone are connected to the **same Wi-Fi network**.
2. Identify your computer's local IP address:
   * Open Command Prompt/PowerShell and type: `ipconfig`
   * Search for **IPv4 Address** (usually starts with `192.168.x.x`).
3. Open the browser on your phone and navigate to:
   `http://<YOUR_COMPUTER_IP>:8000`
4. Log in with your credentials.

---

## 🔑 Seeded Login Credentials

* **Florence Osanya** (Main Owner, phone: `0721470131`):
  * Username: `florence`
  * Password: `Ralphedd@123`
* **Ralph Osiko** (Owner, phone: `0712522925`):
  * Username: `ralph`
  * Password: `Ralphedd@123`

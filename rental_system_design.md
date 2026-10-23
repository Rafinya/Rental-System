
# RENTAL MANAGEMENT SYSTEM — COMPLETE DESIGN DOCUMENT

## 1. SYSTEM OVERVIEW

A full-featured rental management platform for landlords to manage tenants, rent collection, arrears, tax obligations, maintenance, and automated communications.

**Target Users:** Landlords, Property Managers, Maintenance Coordinators
**Platform:** Web Application + Mobile-Responsive + SMS Gateway Integration

---

## 2. CORE ENTITIES & DATABASE SCHEMA

### 2.1 Properties (Apartments/Buildings)
```
property_id (PK)
landlord_id (FK)
property_name
address_line_1, address_line_2
city, state, zip_code, country
property_type [apartment, house, commercial, duplex]
total_units
purchase_price (for tax depreciation)
property_tax_rate (local rate)
purchase_date
created_at, updated_at
```

### 2.2 Units (Individual Rental Units)
```
unit_id (PK)
property_id (FK)
unit_number
unit_type [studio, 1-bed, 2-bed, 3-bed+, penthouse]
square_footage
monthly_rent
security_deposit_amount
status [vacant, occupied, under_maintenance]
current_tenant_id (FK, nullable)
```

### 2.3 Tenants
```
tenant_id (PK)
unit_id (FK)
first_name, last_name
email
phone_number (primary) — REQUIRED FOR SMS REMINDERS
phone_number_2 (emergency)
id_number / passport
date_of_birth
emergency_contact_name
emergency_contact_phone
employment_status
employer_name
monthly_income
move_in_date
move_out_date (nullable)
lease_start_date
lease_end_date
lease_document_url
status [active, inactive, pending, blacklisted]
created_at
```

### 2.4 Rent Payments
```
payment_id (PK)
tenant_id (FK)
unit_id (FK)
property_id (FK)
payment_month (YYYY-MM)
payment_due_date (1st of month)
rent_amount
late_fee_amount
total_due
amount_paid
payment_date (nullable)
payment_method [cash, bank_transfer, mobile_money, check, card]
transaction_reference
payment_status [pending, paid, partial, overdue, waived]
receipt_url
created_at
```

### 2.5 Arrears (Auto-Generated View/Table)
```
arrear_id (PK)
tenant_id (FK)
unit_id (FK)
property_id (FK)
month_due
amount_owed
days_overdue
late_fee_accrued
total_arrears
last_reminder_sent_date
reminder_count
status [active, settled, payment_plan, legal_action]
```

### 2.6 Tax Records
```
tax_record_id (PK)
property_id (FK)
tax_year
tax_period [Q1, Q2, Q3, Q4, Annual]
total_rental_income
deductible_expenses_total
repair_deductions
management_fee_deductions
insurance_deductions
mortgage_interest_deduction
depreciation_deduction
utilities_paid_by_landlord
other_deductions
taxable_income
tax_rate_applied
tax_amount_due
tax_paid_date
tax_receipt_url
status [draft, filed, paid, overdue]
created_at
```

### 2.7 Repairs & Maintenance
```
repair_id (PK)
property_id (FK)
unit_id (FK, nullable — for common areas)
tenant_id (FK, nullable — if tenant reported)
category [plumbing, electrical, HVAC, structural, appliance, painting, roofing, pest_control, cleaning, other]
priority [emergency, high, medium, low]
title
description
estimated_cost
actual_cost
assigned_contractor_id (FK, nullable)
contractor_name (if external)
contractor_phone
scheduled_date
completed_date
before_photos_urls [array]
after_photos_urls [array]
status [reported, in_progress, waiting_parts, completed, cancelled]
tenant_notified [boolean]
invoice_url
created_at, updated_at
```

### 2.8 Expenses (General)
```
expense_id (PK)
property_id (FK)
unit_id (FK, nullable)
category [repair, insurance, utilities, management_fees, legal, advertising, cleaning, supplies, property_tax, mortgage_interest, other]
amount
description
receipt_url
date_incurred
tax_deductible [boolean]
created_at
```

### 2.9 Reminders / Notifications
```
reminder_id (PK)
tenant_id (FK, nullable)
property_id (FK)
type [rent_due, rent_overdue, lease_expiring, maintenance_scheduled, tax_filing, custom]
message_content
channel [sms, email, in_app, whatsapp]
scheduled_send_date
sent_date (nullable)
status [scheduled, sent, failed, cancelled]
```

### 2.10 Contractors / Vendors
```
contractor_id (PK)
name
specialty [plumbing, electrical, HVAC, general, roofing, etc.]
phone
email
company_name
hourly_rate
rating
notes
created_at
```

### 2.11 Documents
```
document_id (PK)
property_id (FK, nullable)
unit_id (FK, nullable)
tenant_id (FK, nullable)
document_type [lease, receipt, tax_document, inspection_report, repair_invoice, insurance, other]
title
file_url
uploaded_by
uploaded_at
```

---

## 3. FEATURE MODULES

### MODULE 1: DASHBOARD
- **Rent Overview Card:** Total expected this month, collected so far, outstanding
- **Arrears Alert Card:** Count of tenants in arrears, total amount owed
- **Occupancy Rate:** Visual gauge showing % occupied vs vacant
- **Maintenance Alerts:** Pending repairs count, emergency repairs highlighted
- **Tax Status:** Current quarter/annual tax status, days until filing deadline
- **Upcoming Events:** Lease expirations, scheduled maintenance, rent due dates
- **Quick Actions:** Add payment, log repair, send reminder, add expense

### MODULE 2: TENANT MANAGEMENT
- Add/Edit/Archive tenants
- View tenant profile with payment history
- Upload lease documents
- Track lease expiration (auto-alerts 60/30/7 days before)
- Tenant communication log
- Move-in / Move-out checklist
- Security deposit tracking

### MODULE 3: RENT COLLECTION
- **Monthly Rent View:** Grid showing all units, tenant names, rent amount, payment status (color-coded)
- **Record Payment:** Quick form — select tenant, enter amount, payment method, date, upload receipt
- **Partial Payment Handling:** System tracks remaining balance, applies to next month or arrears
- **Late Fee Auto-Calculation:** Configurable grace period (e.g., 5 days), then auto-applies late fee
- **Payment History:** Filterable by tenant, date range, property, status
- **Export:** PDF receipts, Excel payment reports

### MODULE 4: ARREARS MANAGEMENT
- **Arrears Dashboard:** All tenants with outstanding balances
  - Tenant name, unit, months owed, amount due, days overdue
  - Sort by: amount, days overdue, property
- **Auto-Generated Arrears:** System creates arrears record when payment is not received by due date + grace period
- **Payment Plans:** Allow creating installment plans for tenants in arrears
- **Escalation Tracking:** Log of reminders sent, legal notices, eviction proceedings
- **Settlement:** Record when arrears are fully or partially settled
- **Arrears Aging Report:** 0-30 days, 31-60 days, 61-90 days, 90+ days

### MODULE 5: AUTOMATED REMINDERS (SMS / EMAIL)
**Configuration:**
- Default: Send rent reminder SMS on 1st of every month to ALL active tenants
- Customizable message template
- Additional reminders: 3 days before due, on due date, 3 days after (overdue notice)
- WhatsApp Business API integration (optional)

**Reminder Types:**
1. **Rent Due Reminder** (1st of month) — "Hi [Name], your rent of [Amount] for [Unit] is due today. Please pay by [Due Date]."
2. **Overdue Notice** (After grace period) — "Hi [Name], your rent of [Amount] is now [X] days overdue. Late fees may apply."
3. **Lease Expiry Warning** (60, 30, 7 days before)
4. **Maintenance Scheduled** — Notify tenant of upcoming repair visit
5. **Tax Filing Reminder** — For landlord (quarterly/annual deadlines)

**SMS Gateway Integration:** Twilio, Africa's Talking, MessageBird, or local provider

### MODULE 6: TAX MANAGEMENT
**Tax Calculation Engine:**

**Inputs (Auto-Populated):**
- Total rental income (from rent payments) per period
- Repair expenses (from repair module)
- General expenses (from expense module)
- Insurance premiums
- Mortgage interest
- Property management fees
- Utilities paid by landlord
- Property tax paid

**Deductions (Configurable by Country/Region):**
- Standard repair & maintenance deductions
- Depreciation (straight-line over useful life, e.g., 27.5 years US, varies by country)
- Mortgage interest
- Insurance
- Management fees
- Travel expenses to property
- Legal/professional fees
- Home office (if applicable)

**Calculation Formula:**
```
Gross Rental Income
- Vacancy Loss (unpaid rent)
- Operating Expenses (repairs, maintenance, utilities, insurance, management fees)
- Mortgage Interest
- Depreciation
- Property Tax
= Taxable Rental Income

Taxable Rental Income × Tax Rate = Tax Amount Due
```

**Features:**
- Quarterly and Annual tax summaries
- Auto-calculate as data comes in (real-time estimate)
- Tax bracket configuration (progressive or flat)
- Export tax reports for accountant (PDF/Excel)
- Tax payment tracking (mark as paid, upload receipt)
- Comparison: Current year vs previous year

### MODULE 7: REPAIRS & MAINTENANCE
- **Report Repair:** Tenant or landlord logs issue with photos, description, priority
- **Repair Queue:** Kanban board view — Reported → In Progress → Waiting Parts → Completed
- **Contractor Assignment:** Assign internal or external contractor, track contact info
- **Cost Tracking:** Estimated vs actual cost
- **Photo Documentation:** Before/after photos
- **Recurring Maintenance:** Schedule recurring tasks (HVAC filter change, pest control, fire extinguisher check)
- **Maintenance Calendar:** View all scheduled repairs/maintenance
- **Tenant Notification:** Auto-notify tenant when repair is scheduled/completed
- **Warranty Tracking:** Track appliance warranties, alert before expiry

### MODULE 8: EXPENSE TRACKING
- Log all property-related expenses
- Auto-categorize for tax purposes
- Receipt upload and storage
- Expense reports by property, category, date range
- Budget vs Actual analysis

### MODULE 9: REPORTING & ANALYTICS
- **Financial Reports:**
  - Monthly/Annual Income Statement (Revenue - Expenses = Net Income)
  - Rent Roll (all units, tenants, rents, lease dates)
  - Cash Flow Statement
  - Expense Breakdown by Category
- **Tenant Reports:**
  - Payment history per tenant
  - Arrears report
  - Lease expiration report
- **Property Reports:**
  - Occupancy trends
  - Maintenance costs by property
  - ROI per property
- **Tax Reports:**
  - Deductible expenses summary
  - Depreciation schedule
  - Tax filing worksheet

### MODULE 10: DOCUMENT MANAGEMENT
- Centralized document storage per property/unit/tenant
- Document types: Leases, receipts, inspection reports, tax docs, insurance policies
- Expiry alerts (insurance, leases, certificates)
- Secure cloud storage with access control

### MODULE 11: LEASE MANAGEMENT
- Lease template generator
- Digital signature integration (DocuSign, HelloSign)
- Lease renewal workflow (auto-reminder → draft renewal → sign → update system)
- Rent escalation tracking (annual increases per lease terms)
- Lease clause library

### MODULE 12: INSPECTIONS
- Move-in inspection checklist with photos
- Move-out inspection checklist with photos
- Periodic inspection scheduling (quarterly/semi-annual)
- Inspection report generation
- Damage assessment and deposit deduction tracking

---

## 4. API ENDPOINTS (RESTful)

### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
```

### Properties
```
GET    /api/properties
POST   /api/properties
GET    /api/properties/{id}
PUT    /api/properties/{id}
DELETE /api/properties/{id}
GET    /api/properties/{id}/units
GET    /api/properties/{id}/financials
```

### Units
```
GET    /api/units
POST   /api/units
GET    /api/units/{id}
PUT    /api/units/{id}
GET    /api/units/{id}/tenant
GET    /api/units/{id}/payments
```

### Tenants
```
GET    /api/tenants
POST   /api/tenants
GET    /api/tenants/{id}
PUT    /api/tenants/{id}
DELETE /api/tenants/{id}
GET    /api/tenants/{id}/payments
GET    /api/tenants/{id}/arrears
GET    /api/tenants/{id}/repairs
POST   /api/tenants/{id}/reminders
```

### Rent Payments
```
GET    /api/payments
POST   /api/payments
GET    /api/payments/{id}
PUT    /api/payments/{id}
GET    /api/payments/summary?month=2024-01
POST   /api/payments/bulk-record
```

### Arrears
```
GET    /api/arrears
GET    /api/arrears/{id}
PUT    /api/arrears/{id}/settle
POST   /api/arrears/{id}/payment-plan
GET    /api/arrears/aging-report
```

### Tax
```
GET    /api/tax/summary?year=2024&period=Q1
GET    /api/tax/calculate
POST   /api/tax/record
GET    /api/tax/deductions
GET    /api/tax/export
PUT    /api/tax/{id}/mark-paid
```

### Repairs
```
GET    /api/repairs
POST   /api/repairs
GET    /api/repairs/{id}
PUT    /api/repairs/{id}
POST   /api/repairs/{id}/assign-contractor
PUT    /api/repairs/{id}/complete
GET    /api/repairs/priority/{level}
```

### Reminders
```
GET    /api/reminders
POST   /api/reminders
PUT    /api/reminders/{id}/cancel
GET    /api/reminders/templates
POST   /api/reminders/send-bulk
```

### Expenses
```
GET    /api/expenses
POST   /api/expenses
GET    /api/expenses/summary
```

### Reports
```
GET    /api/reports/rent-roll
GET    /api/reports/income-statement
GET    /api/reports/cash-flow
GET    /api/reports/occupancy
GET    /api/reports/export?type=pdf|excel
```

---

## 5. BUSINESS LOGIC FLOWS

### Rent Collection Flow
```
1st of Month → System auto-generates rent payment records for all active tenants
         ↓
SMS Reminder sent to all tenants (configurable time, e.g., 8:00 AM)
         ↓
Tenant pays → Landlord records payment in system
         ↓
If paid in full → Mark as PAID, generate receipt
         ↓
If not paid by Due Date + Grace Period → Mark as OVERDUE
         ↓
Auto-generate ARREARS record
         ↓
Send overdue SMS reminder
         ↓
Every 7 days → Send follow-up reminder (configurable)
         ↓
If arrears > 90 days → Flag for legal action, notify landlord
```

### Tax Calculation Flow
```
End of Tax Period (Quarter/Year)
         ↓
System aggregates:
  - All rent payments received (income)
  - All repair costs (deduction)
  - All expenses (deduction)
  - Mortgage interest (input by landlord)
  - Depreciation (auto-calculated based on purchase price & date)
         ↓
Calculate Taxable Income
         ↓
Apply Tax Rate (progressive or flat based on landlord profile)
         ↓
Generate Tax Estimate
         ↓
Landlord reviews & adjusts
         ↓
Mark as FILED → Mark as PAID (when tax actually paid)
```

### Repair Request Flow
```
Repair Reported (by tenant or landlord)
         ↓
Log in system with photos, description, priority
         ↓
If EMERGENCY → Immediate SMS to landlord + contractor
         ↓
Assign Priority & Category
         ↓
Assign Contractor (internal or external)
         ↓
Schedule Date
         ↓
Notify Tenant of scheduled visit
         ↓
Contractor completes work → Upload after photos, actual cost
         ↓
Mark as COMPLETED
         ↓
Tenant notified of completion
         ↓
Cost auto-logs to expenses (tax-deductible)
```

---

## 6. REMINDER SYSTEM ARCHITECTURE

**Scheduler:** Cron job running daily at configurable time (default 08:00)

**Monthly Rent Reminder (1st of every month):**
```python
# Pseudo-logic
def send_monthly_rent_reminders():
    today = get_today_date()
    if today.day == 1:
        active_tenants = get_all_active_tenants()
        for tenant in active_tenants:
            rent_amount = tenant.unit.monthly_rent
            message = f"Hi {tenant.first_name}, your rent of {rent_amount} for Unit {tenant.unit.unit_number} is due today ({today}). Please make payment. - {landlord_name}"
            send_sms(tenant.phone_number, message)
            log_reminder(tenant.id, "rent_due", "sms", "sent")
```

**Overdue Reminders:**
- Check daily for payments with status OVERDUE
- Send escalating reminders: Day 1 (gentle), Day 7 (firm), Day 14 (final notice)
- Track reminder count to avoid spam

**Lease Expiry Reminders:**
- Daily check for leases expiring in 60, 30, 7 days
- Send to both tenant and landlord

---

## 7. SECURITY & ACCESS CONTROL

- **Role-Based Access:**
  - Landlord (full access)
  - Property Manager (limited admin access)
  - Tenant (view-only their own data, submit repairs)
  - Accountant (view financials, tax data only)
- **Data Encryption:** AES-256 for data at rest, TLS 1.3 for data in transit
- **2FA:** Optional two-factor authentication for landlord accounts
- **Audit Log:** All payment edits, tenant changes logged with user & timestamp

---

## 8. TECH STACK RECOMMENDATION

| Layer | Technology |
|-------|-----------|
| Frontend | React.js / Next.js or Vue.js |
| Backend | Node.js (Express) or Python (Django/FastAPI) |
| Database | PostgreSQL (primary) + Redis (caching) |
| SMS Gateway | Twilio / Africa's Talking / MessageBird |
| File Storage | AWS S3 / Cloudinary |
| Scheduler | Node-cron / Celery Beat |
| Auth | JWT + bcrypt |
| Deployment | Docker + AWS / DigitalOcean / Heroku |

---

## 9. ADDITIONAL FEATURES (BONUS)

1. **Tenant Portal:** Self-service portal where tenants can view payment history, download receipts, submit repair requests
2. **Online Payments:** Integrate M-Pesa, Stripe, PayPal for tenants to pay rent directly
3. **Multi-Currency Support:** For landlords with properties in different countries
4. **Insurance Tracking:** Property insurance policies with renewal alerts
5. **Utility Management:** Track utilities (water, electricity) if landlord pays, bill-back to tenants
6. **Vacancy Marketing:** When unit becomes vacant, auto-generate listing description for platforms
7. **Tenant Screening:** Integration with credit check / background check APIs
8. **Rent Escalation:** Auto-apply annual rent increases based on lease terms or inflation index
9. **Mobile App:** Native iOS/Android app for on-the-go management
10. **AI Insights:** Predict which tenants are likely to be late based on payment history patterns
11. **Bank Reconciliation:** Auto-match bank statement transactions to rent payments
12. **Digital Signatures:** Integrated lease signing
13. **Multi-Landlord:** If building for SaaS — multiple landlords, subscription tiers

---

## 10. ENTITY RELATIONSHIP DIAGRAM (Simplified)

```
LANDLORD (1) ───< (N) PROPERTY (1) ───< (N) UNIT (1) ───< (1) TENANT
                                              │
                                              ├──< (N) RENT_PAYMENT
                                              ├──< (N) REPAIR
                                              ├──< (N) EXPENSE
                                              └──< (N) DOCUMENT

PROPERTY (1) ───< (N) TAX_RECORD
TENANT (1) ───< (N) REMINDER
UNIT (1) ───< (N) REMINDER
```

---

## 11. IMPLEMENTATION PHASES

**Phase 1 — MVP (Weeks 1-4):**
- Property & Unit management
- Tenant CRUD + phone numbers
- Rent payment recording
- Basic arrears tracking
- SMS reminders on 1st of month
- Simple tax calculation

**Phase 2 — Core (Weeks 5-8):**
- Repair & maintenance module
- Expense tracking
- Document management
- Automated overdue reminders
- Tax export reports

**Phase 3 — Advanced (Weeks 9-12):**
- Reporting & analytics dashboard
- Lease management
- Inspection checklists
- Tenant portal
- Online payment integration

---

## SUMMARY

This rental system provides:
✅ **Rent tracking** — Monthly view of all tenant payments, status, history  
✅ **Arrears management** — Auto-detection, aging reports, payment plans  
✅ **Tax calculation** — Auto-aggregation of income/expenses, deductions, tax estimate  
✅ **SMS Reminders** — Automated on 1st of every month + overdue follow-ups  
✅ **Repair logging** — Full maintenance workflow with contractors, costs, photos  
✅ **Plus:** Expenses, documents, leases, inspections, reports, tenant portal  

When you send the apartment revenue data, I can help you configure the tax module with the correct rates and deductions for your specific situation.

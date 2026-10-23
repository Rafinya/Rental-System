import os
from fpdf import FPDF
from database import get_db_connection

# Load configurations with environment variables and default fallbacks
LANDLORDS = os.getenv("LANDLORDS", "Osanya F and Osiko R")
BANK_NAME = os.getenv("BANK_NAME", "Absa Bank Queensway")
BANK_ACC = os.getenv("BANK_ACC", "2053 9252 54")
PAYBILL = os.getenv("PAYBILL", "303030")
OPS_PHONE = os.getenv("OPS_PHONE", "0712522925")

def create_agreement_pdf(unit_id, rent, output_path):
    try:
        pdf = FPDF()
        pdf.add_page()
        
        # Title
        pdf.set_font("Helvetica", "B", 16)
        pdf.cell(0, 10, "WEEN LOFT APARTMENT - RENTAL AGREEMENT", ln=True, align="C")
        pdf.ln(10)
        
        # Details
        pdf.set_font("Helvetica", "", 12)
        
        content = f"""This Rental Agreement is made between WEENA LOFT APARTMENT (hereinafter referred to as "Landlord") and the Tenant (whose details shall be appended upon signing).

1. PREMISES: The Landlord agrees to rent to the Tenant, and the Tenant agrees to rent from the Landlord, the premises located at Weena Loft Apartment, Unit Number: {unit_id}.

2. TERM: The term of this agreement shall commence on the move-in date and continue on a month-to-month basis until terminated by either party with a one-month written notice.

3. RENT: The monthly rent for the premises is KES {rent:,.2f}. Rent is due and payable on the 1st day of each month. 
A grace period is provided until the 10th of the month. After the 10th, a 5% late fee will be added to the rent cost.

4. PAYMENT METHOD: Rent payments must be deposited into the designated bank account:
Bank: {BANK_NAME}
Account: {BANK_ACC}
Paybill: {PAYBILL}
Strictly no M-Pesa. Thank you.

5. SECURITY DEPOSIT: Upon execution of this agreement, the Tenant shall deposit with the Landlord the sum of KES {rent:,.2f} as a security deposit. This deposit is held to cover any damages to the premises or unpaid rent upon vacating.

6. UTILITIES: The Tenant is responsible for the payment of all utilities and services connected to the unit, unless otherwise specified by the Landlord.

7. MAINTENANCE AND REPAIRS: The Tenant shall keep the premises in clean and good condition. Any required repairs must be logged with the Operations Manager.

8. INQUIRIES: For any inquiries, contact the Operations Manager at {OPS_PHONE}.

By signing below, both parties acknowledge and agree to the terms and conditions outlined above.

________________________________________
Landlord Signature & Date

________________________________________
Tenant Signature & Date
"""
        
        pdf.multi_cell(0, 8, content)
        pdf.output(output_path)
    except Exception as e:
        print(f"Error creating PDF for unit {unit_id}: {e}")

def generate_all():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT * FROM units')
        units = cursor.fetchall()
        
        # Setup directories
        base_dir = os.path.join("Rent Agreement", "Weena Loft Apartment")
        os.makedirs(base_dir, exist_ok=True)
        
        count = 0
        for unit in units:
            unit_id = unit['id']
            rent = unit['rent']
            
            # Clean unit ID for filename
            safe_unit_id = "".join(c for c in unit_id if c.isalnum() or c in (' ', '_', '-')).strip()
            filename = f"Weena_Loft_Agreement_Unit_{safe_unit_id}.pdf"
            filepath = os.path.join(base_dir, filename)
            
            create_agreement_pdf(unit_id, rent, filepath)
            count += 1
            print(f"Generated: {filename}")
            
        print(f"\nTotal agreements generated: {count}")
    except Exception as e:
        print(f"Database query error during agreement generation: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    generate_all()

from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 16)
        self.cell(0, 10, 'Insurance Project Execution Commands', 0, 1, 'C')
        self.ln(10)

    def chapter_title(self, title):
        self.set_font('Arial', 'B', 12)
        self.set_fill_color(200, 220, 255)
        self.cell(0, 10, title, 0, 1, 'L', 1)
        self.ln(4)

    def chapter_body(self, body):
        self.set_font('Courier', '', 10)
        self.multi_cell(0, 10, body)
        self.ln()

pdf = PDF()
pdf.add_page()

# Intro
pdf.set_font('Arial', '', 11)
pdf.multi_cell(0, 10, "This document contains the terminal commands required to run the Insurance Platform projects using the shared backend architecture.")
pdf.ln(5)

# Shared Backend
pdf.chapter_title("1. Shared Backend (API)")
pdf.chapter_body("cd \"shared_backend\"\n.\\.venv\\Scripts\\python -m uvicorn main:app --host 0.0.0.0 --port 8000")

# Customer
pdf.chapter_title("2. Customer Portal Frontend")
pdf.chapter_body("cd \"customer\"\nnpm run dev")

# Customer-Support
pdf.chapter_title("3. Customer Support Frontend")
pdf.chapter_body("cd \"customer-support\"\nnpm run dev")

# Insure-Agent
pdf.chapter_title("4. Insure Agent Frontend")
pdf.chapter_body("cd \"insure-agent\"\nnpm run dev")

# Hospital Claim Form
pdf.chapter_title("5. Hospital Claim Form Frontend")
pdf.chapter_body("cd \"hospital claim form\"\nnpm run dev")

# Footer Note
pdf.set_font('Arial', 'I', 10)
pdf.multi_cell(0, 10, "Note: All frontends are configured to connect to the backend at http://localhost:8000. Each frontend will automatically start on a unique port (8080-8083) to avoid conflicts.")

pdf.output("Run-Projects-Commands.pdf")
print("PDF generated: Run-Projects-Commands.pdf")

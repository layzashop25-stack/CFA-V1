# 🏛️ CFP Management System — نظام إدارة مركز التكوين المهني

<div align="center">

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A professional, government-grade Student Management System for Moroccan Vocational Training Centers**

[🇲🇦 العربية](#) · [🇫🇷 Français](#) · [🇬🇧 English](#)

</div>

---

## ✨ Features

### 📊 Dashboard
- Real-time KPI cards — total students, active, dropouts, average absences
- Interactive charts — bar chart per filière, donut level distribution
- Absence alerts for students exceeding 6 days
- Health coverage progress bars
- Quick action buttons

### 👤 Student Management (إدارة المتدربين)
- Full CRUD with 4-step form (Personal → Academic → Guardian → Health & Social)
- Search & filter by name, CIN, phone, filière, level, status
- Dropout toggle with date and reason
- Bulk select, export, delete
- Import from Excel (.xlsx)
- Download registration form PDF (فيشة التسجيل)

### 🎓 Filières (الشعب)
- 7 pre-loaded vocational programs
- Card grid with active rate progress bar
- Detail page with enrolled students, stats, PDF/Excel export
- Add / edit / delete filières

### 📅 Absence Management (إدارة الغياب)
- **Dynamic days** — automatically shows 28/29/30/31 days based on month & year
- Click-to-toggle absence cells (edit mode)
- Justified absences (✓ amber) vs unjustified (✗ red)
- Grouped by filière with collapsible rows
- Color-coded totals (green / orange / red)
- Export to PDF (A3 landscape) and Excel

### 📝 Grades / Notes (النقط)
- Inline grade editing per filière and semester (S1/S2)
- Auto-calculated final result: Theory × 40% + Practical × 60%
- Pass/fail badges with summary footer

### 🔧 Equipment (المعدات)
- Grid and table views
- Photo upload (stored as base64)
- Status tracking: Good / Maintenance / Broken
- Linked to filières

### 👨‍🏫 Trainers (المكونين)
- Full trainer profiles with photo
- Multi-filière assignment
- Contract types: Permanent / Contract / Part-time
- Salary field (ready for net calculation feature)
- Grade levels: Professor / Assistant / Technician

### 💾 Data Management
- Export all data to JSON (selective: students, filières, absences, notes)
- Import JSON with merge or replace mode
- Preview before import

---

## 🌐 Internationalization

Fully translated in **3 languages** with instant switching:

| Language | Direction | Default |
|----------|-----------|---------|
| 🇲🇦 العربية (AR) | RTL | ✅ Yes |
| 🇫🇷 Français (FR) | LTR | — |
| 🇬🇧 English (EN) | LTR | — |

---

## 🎨 Design System

- **Sidebar:** Dark slate `#1e293b` with amber `#f59e0b` active states
- **Accent:** Amber for buttons, highlights, active nav
- **Typography:** Cairo (Arabic) + Segoe UI (Latin)
- **Dark mode:** Full support via toggle in topbar
- **RTL/LTR:** Auto-switches layout direction on language change

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS + Custom CSS |
| Routing | React Router v6 |
| State | Zustand |
| Persistence | localStorage |
| PDF | jsPDF + jsPDF-AutoTable |
| Excel | SheetJS (xlsx) |
| Charts | Recharts |
| Icons | Lucide React |
| i18n | i18next + react-i18next |
| Toasts | react-hot-toast |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/cfp-management.git
cd cfp-management

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/          # Sidebar, Header, Layout
│   ├── students/        # StudentList, StudentForm, StudentCard, StudentImport
│   ├── filieres/        # FiliereList, FiliereDetail
│   ├── absences/        # AbsenceTable
│   ├── notes/           # NotesManager
│   └── shared/          # ConfirmModal, Pagination, LanguageSwitcher
├── pages/               # Dashboard, Students, Filieres, Absences, Notes,
│                        # Equipment, Trainers, DataManagement
├── store/
│   └── useStore.js      # Zustand store (students, filieres, absences,
│                        #   notes, equipment, trainers)
├── locales/
│   ├── ar.json          # Arabic translations
│   ├── fr.json          # French translations
│   └── en.json          # English translations
├── utils/
│   ├── exportPDF.js     # jsPDF generators
│   └── exportExcel.js   # SheetJS generators
└── data/
    └── initialData.js   # Seed data (5 students, 7 filières)
```

---

## 📦 Pre-loaded Data

The system seeds with sample data on first launch:

- **5 students** across different filières and levels
- **7 filières:** Pâtisserie, Assistant Social, Mécanicien Auto, Électricien Auto, Électricité Bâtiments, Assistant Préscolaire, Opérateur Informatique

---

## 🔮 Roadmap

- [ ] Trainer net salary calculator + PDF payslip
- [ ] Student photo upload
- [ ] Detailed module grades (per subject)
- [ ] Absence impact on final grade
- [ ] Print-optimized CSS for all pages
- [ ] PWA support (offline mode)
- [ ] Backend API integration

---

## 📄 License

MIT © 2024 — Centre de Formation Professionnelle

---

<div align="center">
  Built with ❤️ for Moroccan Vocational Training Centers
</div>

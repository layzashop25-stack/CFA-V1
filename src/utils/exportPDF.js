import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Helper: add Arabic-friendly header
function addHeader(doc, title, subtitle = '') {
  doc.setFillColor(26, 92, 56)
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Centre de Formation Professionnelle', 105, 11, { align: 'center' })
  doc.setFontSize(10)
  doc.text(title, 105, 19, { align: 'center' })
  if (subtitle) {
    doc.setFontSize(9)
    doc.text(subtitle, 105, 25, { align: 'center' })
  }
  // Gold line
  doc.setDrawColor(201, 162, 39)
  doc.setLineWidth(1)
  doc.line(0, 28, 210, 28)
  doc.setTextColor(0, 0, 0)
}

// Student inscription PDF
export function generateStudentPDF(student, filiere, t) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  addHeader(doc, 'بطاقة تسجيل المتدرب / Fiche d\'inscription du Stagiaire')

  const filName = filiere ? filiere.nameAr : '—'
  const F = t('students.fields', { returnObjects: true })

  const rows = [
    [F.fullName, student.fullName],
    [F.cinNumber, student.cinNumber],
    [F.phone, student.phone],
    [F.birthDate, student.birthDate || '—'],
    [F.birthPlace, student.birthPlace || '—'],
    [F.address, student.address || '—'],
    [F.educationLevel, t(`students.levels.${student.educationLevel}`)],
    [F.filiereId, filName],
    [F.enrollmentYear, student.enrollmentYear || '—'],
    [F.guardianName, student.guardianName || '—'],
    [F.guardianProfession, student.guardianProfession || '—'],
    [F.guardianPhone, student.guardianPhone || '—'],
    [F.familyStatus, t(`students.familyStatus.${student.familyStatus}`) || '—'],
    [F.maritalStatus, t(`students.maritalStatus.${student.maritalStatus}`) || '—'],
    [F.healthStatus, t(`students.healthStatus.${student.healthStatus}`) || '—'],
    [F.healthCoverage, student.healthCoverage || '—'],
    [F.transportMode, t(`students.transportMode.${student.transportMode}`) || '—'],
    [F.residenceArea, t(`students.residenceArea.${student.residenceArea}`) || '—'],
    [F.hasFixedIncome, student.hasFixedIncome ? t('students.yes') : t('students.no')],
    [F.receivesSocialSupport, student.receivesSocialSupport ? t('students.yes') : t('students.no')],
    [F.isWorking, student.isWorking ? t('students.yes') : t('students.no')],
  ]

  if (student.isDropout) {
    rows.push([F.dropoutDate, student.dropoutDate || '—'])
    rows.push([F.dropoutReason, student.dropoutReason || '—'])
  }

  autoTable(doc, {
    startY: 35,
    head: [],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3, font: 'helvetica' },
    columnStyles: {
      0: { fillColor: [240, 247, 243], fontStyle: 'bold', cellWidth: 70 },
      1: { cellWidth: 110 }
    },
    alternateRowStyles: { fillColor: [250, 252, 251] }
  })

  // Signature section
  const finalY = doc.lastAutoTable.finalY + 15
  doc.setFontSize(9)
  doc.setTextColor(80, 80, 80)
  const sigY = finalY + 20
  doc.text('توقيع المتدرب', 30, finalY, { align: 'center' })
  doc.text('توقيع ولي الأمر', 105, finalY, { align: 'center' })
  doc.text('توقيع المسؤول', 180, finalY, { align: 'center' })
  doc.line(10, sigY, 55, sigY)
  doc.line(80, sigY, 130, sigY)
  doc.line(155, sigY, 200, sigY)

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text(`التاريخ: ${new Date().toLocaleDateString('ar-MA')}`, 105, 285, { align: 'center' })

  doc.save(`fiche-${student.fullName.replace(/\s+/g, '-')}.pdf`)
}

// Students list PDF for a filiere
export function exportStudentsPDF(students, filiere, t, lang) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const filName = lang === 'ar' ? filiere.nameAr : lang === 'fr' ? filiere.nameFr : filiere.nameEn

  addHeader(doc, `${t('filieres.enrolledStudents')} — ${filName}`)

  const rows = students.map((s, i) => [
    i + 1,
    s.fullName,
    s.cinNumber,
    s.phone,
    t(`students.levels.${s.educationLevel}`),
    s.enrollmentYear || '—',
    s.isDropout ? t('students.dropout') : t('students.active')
  ])

  autoTable(doc, {
    startY: 35,
    head: [['#', t('students.name'), t('students.cin'), t('students.phone'), t('students.level'), t('students.fields.enrollmentYear'), t('students.status')]],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [26, 92, 56], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 247, 243] },
    styles: { fontSize: 9 }
  })

  doc.save(`etudiants-${filName}.pdf`)
}

// Absence PDF
export function exportAbsencePDF(students, filieres, absences, month, year, t, lang) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' })
  const monthName = t(`absences.months.${month}`)

  addHeader(doc, `كشف الغياب — ${monthName} ${year}`)

  const totalDays = new Date(year, month, 0).getDate()
  const days = Array.from({ length: totalDays }, (_, i) => i + 1)

  filieres.forEach(f => {
    const filStudents = students.filter(s => s.filiereId === f.id && !s.isDropout)
    if (filStudents.length === 0) return

    const filName = lang === 'ar' ? f.nameAr : lang === 'fr' ? f.nameFr : f.nameEn

    const head = [['الاسم', ...days.map(String), 'المجموع']]
    const body = filStudents.map(s => {
      const rec = absences.find(a => a.studentId === s.id && a.month === month && a.year === year)
      const absDays = rec ? rec.absenceDays : []
      return [s.fullName, ...days.map(d => absDays.includes(d) ? '✗' : ''), absDays.length]
    })

    autoTable(doc, {
      startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 35,
      head: [[{ content: filName, colSpan: totalDays + 2, styles: { fillColor: [26, 92, 56], textColor: 255, fontStyle: 'bold', halign: 'center' } }], ...head],
      body,
      theme: 'grid',
      headStyles: { fillColor: [45, 122, 80], textColor: 255, fontSize: 7 },
      styles: { fontSize: 7, cellPadding: 1, halign: 'center' },
      columnStyles: { 0: { halign: 'right', cellWidth: 35 }, [totalDays + 1]: { fontStyle: 'bold' } },
      didParseCell: (data) => {
        if (data.cell.raw === '✗') {
          data.cell.styles.fillColor = [254, 226, 226]
          data.cell.styles.textColor = [220, 38, 38]
          data.cell.styles.fontStyle = 'bold'
        }
      }
    })
  })

  doc.save(`absence-${monthName}-${year}.pdf`)
}

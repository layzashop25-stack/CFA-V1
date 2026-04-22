import * as XLSX from 'xlsx'

export function exportStudentsExcel(students, filieres, lang) {
  const getName = (f) => f ? (lang === 'ar' ? f.nameAr : lang === 'fr' ? f.nameFr : f.nameEn) : '—'

  const rows = students.map((s, i) => ({
    '#': i + 1,
    'الاسم الكامل': s.fullName,
    'رقم البطاقة': s.cinNumber,
    'الهاتف': s.phone,
    'تاريخ الازدياد': s.birthDate,
    'مكان الازدياد': s.birthPlace,
    'العنوان': s.address,
    'المستوى': s.educationLevel,
    'الشعبة': getName(filieres.find(f => f.id === s.filiereId)),
    'سنة التسجيل': s.enrollmentYear,
    'الحالة': s.isDropout ? 'منقطع' : 'نشيط',
    'ولي الأمر': s.guardianName,
    'هاتف ولي الأمر': s.guardianPhone,
    'وضعية الأسرة': s.familyStatus,
    'الحالة الصحية': s.healthStatus,
    'التغطية الصحية': s.healthCoverage,
    'وسط الإقامة': s.residenceArea,
    'ملاحظات': s.notes
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'المتدربون')
  XLSX.writeFile(wb, `students-${new Date().toISOString().split('T')[0]}.xlsx`)
}

export function exportAbsenceExcel(students, filieres, absences, month, year, t, lang) {
  const getName = (f) => f ? (lang === 'ar' ? f.nameAr : lang === 'fr' ? f.nameFr : f.nameEn) : '—'
  const totalDays = new Date(year, month, 0).getDate()
  const days = Array.from({ length: totalDays }, (_, i) => i + 1)
  const wb = XLSX.utils.book_new()

  filieres.forEach(f => {
    const filStudents = students.filter(s => s.filiereId === f.id && !s.isDropout)
    if (filStudents.length === 0) return

    const rows = filStudents.map(s => {
      const rec = absences.find(a => a.studentId === s.id && a.month === month && a.year === year)
      const absDays = rec ? rec.absenceDays : []
      const row = { 'الاسم الكامل': s.fullName }
      days.forEach(d => { row[String(d)] = absDays.includes(d) ? '✗' : '' })
      row['المجموع'] = absDays.length
      return row
    })

    const ws = XLSX.utils.json_to_sheet(rows)
    const sheetName = getName(f).substring(0, 31)
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
  })

  XLSX.writeFile(wb, `absence-${month}-${year}.xlsx`)
}

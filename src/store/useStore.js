import { create } from 'zustand'
import { initialStudents, initialFilieres } from '../data/initialData'

const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch { return fallback }
}
const save = (key, val) => localStorage.setItem(key, JSON.stringify(val))

const useStore = create((set, get) => ({
  students: load('cfp_students', initialStudents),
  filieres: load('cfp_filieres', initialFilieres),
  absences: load('cfp_absences', []),
  notes: load('cfp_notes', []),

  // Students
  addStudent: (student) => {
    const students = [...get().students, student]
    set({ students }); save('cfp_students', students)
  },
  updateStudent: (id, data) => {
    const students = get().students.map(s => s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s)
    set({ students }); save('cfp_students', students)
  },
  deleteStudent: (id) => {
    const students = get().students.filter(s => s.id !== id)
    set({ students }); save('cfp_students', students)
  },
  deleteStudents: (ids) => {
    const students = get().students.filter(s => !ids.includes(s.id))
    set({ students }); save('cfp_students', students)
  },

  // Filieres
  addFiliere: (filiere) => {
    const filieres = [...get().filieres, filiere]
    set({ filieres }); save('cfp_filieres', filieres)
  },
  updateFiliere: (id, data) => {
    const filieres = get().filieres.map(f => f.id === id ? { ...f, ...data } : f)
    set({ filieres }); save('cfp_filieres', filieres)
  },
  deleteFiliere: (id) => {
    const filieres = get().filieres.filter(f => f.id !== id)
    set({ filieres }); save('cfp_filieres', filieres)
  },

  // Absences
  toggleAbsence: (studentId, month, year, day) => {
    const absences = [...get().absences]
    const idx = absences.findIndex(a => a.studentId === studentId && a.month === month && a.year === year)
    if (idx === -1) {
      absences.push({ studentId, month, year, absenceDays: [day], totalAbsences: 1, justifiedDays: [], notes: '' })
    } else {
      const rec = { ...absences[idx] }
      if (rec.absenceDays.includes(day)) {
        rec.absenceDays = rec.absenceDays.filter(d => d !== day)
      } else {
        rec.absenceDays = [...rec.absenceDays, day]
      }
      rec.totalAbsences = rec.absenceDays.length
      absences[idx] = rec
    }
    set({ absences }); save('cfp_absences', absences)
  },
  getAbsence: (studentId, month, year) => {
    return get().absences.find(a => a.studentId === studentId && a.month === month && a.year === year) || { absenceDays: [], justifiedDays: [], totalAbsences: 0 }
  },
  verifyAbsence: (studentId, month, year, day) => {
    const absences = [...get().absences]
    const idx = absences.findIndex(a => a.studentId === studentId && a.month === month && a.year === year)
    if (idx === -1) return
    const rec = { ...absences[idx] }
    const justified = rec.justifiedDays || []
    rec.justifiedDays = justified.includes(day) ? justified.filter(d => d !== day) : [...justified, day]
    absences[idx] = rec
    set({ absences }); save('cfp_absences', absences)
  },

  // Notes
  updateNote: (studentId, filiereId, semester, field, value) => {
    const notes = [...get().notes]
    const idx = notes.findIndex(n => n.studentId === studentId && n.filiereId === filiereId && n.semester === semester)
    if (idx === -1) {
      notes.push({ studentId, filiereId, semester, theory: '', practical: '', [field]: value })
    } else {
      notes[idx] = { ...notes[idx], [field]: value }
    }
    set({ notes }); save('cfp_notes', notes)
  },
  getNote: (studentId, filiereId, semester) => {
    return get().notes.find(n => n.studentId === studentId && n.filiereId === filiereId && n.semester === semester) || { theory: '', practical: '' }
  },

  // Trainers (المكونين)
  trainers: load('cfp_trainers', []),
  addTrainer: (trainer) => {
    const trainers = [...get().trainers, trainer]
    set({ trainers }); save('cfp_trainers', trainers)
  },
  updateTrainer: (id, data) => {
    const trainers = get().trainers.map(t => t.id === id ? { ...t, ...data } : t)
    set({ trainers }); save('cfp_trainers', trainers)
  },
  deleteTrainer: (id) => {
    const trainers = get().trainers.filter(t => t.id !== id)
    set({ trainers }); save('cfp_trainers', trainers)
  },

  // Equipment
  equipment: load('cfp_equipment', []),
  addEquipment: (item) => {
    const equipment = [...get().equipment, item]
    set({ equipment }); save('cfp_equipment', equipment)
  },
  updateEquipment: (id, data) => {
    const equipment = get().equipment.map(e => e.id === id ? { ...e, ...data } : e)
    set({ equipment }); save('cfp_equipment', equipment)
  },
  deleteEquipment: (id) => {
    const equipment = get().equipment.filter(e => e.id !== id)
    set({ equipment }); save('cfp_equipment', equipment)
  },

  // Historique — data is derived from students/trainers/equipment by schoolYear field

  // Data management
  importData: (data, mode) => {
    if (mode === 'replace') {
      const students = data.students || []
      const filieres = data.filieres || get().filieres
      const absences = data.absences || []
      const notes = data.notes || []
      set({ students, filieres, absences, notes })
      save('cfp_students', students); save('cfp_filieres', filieres)
      save('cfp_absences', absences); save('cfp_notes', notes)
    } else {
      const students = [...get().students, ...(data.students || []).filter(ns => !get().students.find(s => s.id === ns.id))]
      const filieres = [...get().filieres, ...(data.filieres || []).filter(nf => !get().filieres.find(f => f.id === nf.id))]
      const absences = [...get().absences, ...(data.absences || [])]
      const notes = [...get().notes, ...(data.notes || [])]
      set({ students, filieres, absences, notes })
      save('cfp_students', students); save('cfp_filieres', filieres)
      save('cfp_absences', absences); save('cfp_notes', notes)
    }
  }
}))

export default useStore

import { v4 as uuidv4 } from 'uuid'

// Diploma types:
// DSP (شهادة التخصص) — requires 6th primary (6eme) or more, 1 year
// DQP (شهادة التأهيل) — requires 9th grade (3eme collège) or more, 2 years
// CAP (شهادة التدرج المهني) — below 6th primary, only for كهرباء المباني, leads to DSP
export const initialFilieres = [
  { id: 'halawani',             nameAr: 'الحلواني',                    nameFr: 'Pâtisserie',              nameEn: 'Pastry Making',       requiredLevel: '6eme', duration: 1, diplomaType: 'DSP', description: '' },
  { id: 'assistant-social',     nameAr: 'مساعد اجتماعي',              nameFr: 'Assistant Social',        nameEn: 'Social Assistant',    requiredLevel: '3eme', duration: 2, diplomaType: 'DQP', description: '' },
  { id: 'mecanique-auto',       nameAr: 'مصلح السيارات',              nameFr: 'Mécanicien Auto',         nameEn: 'Auto Mechanic',       requiredLevel: '3eme', duration: 2, diplomaType: 'DQP', description: '' },
  { id: 'electricite-auto',     nameAr: 'كهربائي السيارات',           nameFr: 'Électricien Auto',        nameEn: 'Auto Electrician',    requiredLevel: '3eme', duration: 2, diplomaType: 'DQP', description: '' },
  { id: 'electricite-batiments',nameAr: 'كهرباء المباني',             nameFr: 'Électricité Bâtiments',   nameEn: 'Building Electricity',requiredLevel: '6eme', duration: 1, diplomaType: 'DSP', description: '' },
  { id: 'electricite-bat-cap',  nameAr: 'كهرباء المباني (CAP)',       nameFr: 'Électricité Bât. (CAP)',  nameEn: 'Building Elec. (CAP)',requiredLevel: 'cap', duration: 1, diplomaType: 'CAP', description: 'شهادة التدرج المهني — أقل من السادسة ابتدائي' },
  { id: 'assistant-roudh',      nameAr: 'مساعد الروض والحضانة',       nameFr: 'Assistant Préscolaire',   nameEn: 'Preschool Assistant', requiredLevel: '3eme', duration: 2, diplomaType: 'DQP', description: '' },
  { id: 'informatique',         nameAr: 'عامل في الرقانة المعلوماتية',nameFr: 'Opérateur en Informatique',nameEn: 'Computer Operator',  requiredLevel: '6eme', duration: 1, diplomaType: 'DSP', description: '' }
]

export const initialStudents = []

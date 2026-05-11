import { v4 as uuidv4 } from 'uuid'

export const initialFilieres = [
  { id: 'halawani', nameAr: 'الحلواني', nameFr: 'Pâtisserie', nameEn: 'Pastry Making', requiredLevel: 'all', duration: 1, diplomaType: 'تخصص', description: '' },
  { id: 'assistant-social', nameAr: 'مساعد اجتماعي', nameFr: 'Assistant Social', nameEn: 'Social Assistant', requiredLevel: 'bac', duration: 2, diplomaType: 'تأهيل', description: '' },
  { id: 'mecanique-auto', nameAr: 'مصلح السيارات', nameFr: 'Mécanicien Auto', nameEn: 'Auto Mechanic', requiredLevel: '9eme', duration: 2, diplomaType: 'تأهيل', description: '' },
  { id: 'electricite-auto', nameAr: 'كهربائي السيارات', nameFr: 'Électricien Auto', nameEn: 'Auto Electrician', requiredLevel: '9eme', duration: 2, diplomaType: 'تأهيل', description: '' },
  { id: 'electricite-batiments', nameAr: 'كهرباء المباني', nameFr: 'Électricité Bâtiments', nameEn: 'Building Electricity', requiredLevel: '7eme', duration: 1, diplomaType: 'تخصص', description: '' },
  { id: 'assistant-roudh', nameAr: 'مساعد الروض والحضانة', nameFr: 'Assistant Préscolaire', nameEn: 'Preschool Assistant', requiredLevel: '9eme', duration: 2, diplomaType: 'تأهيل', description: '' },
  { id: 'informatique', nameAr: 'عامل في الرقانة المعلوماتية', nameFr: 'Opérateur en Informatique', nameEn: 'Computer Operator', requiredLevel: '7eme', duration: 1, diplomaType: 'تخصص', description: '' }
]

const now = new Date().toISOString()

export const initialStudents = [
  
]

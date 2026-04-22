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
  {
    id: uuidv4(), fullName: 'أحمد بنعلي', birthDate: '2000-03-15', birthPlace: 'الرباط',
    address: 'حي المحمدي، الرباط', cinNumber: 'AB123456', phone: '0612345678',
    educationLevel: '9eme', stillStudying: false, otherTraining: false,
    desiredFiliere: 'mecanique-auto', filiereId: 'mecanique-auto', enrollmentYear: '2024',
    isDropout: false, dropoutDate: '', dropoutReason: '',
    guardianName: 'محمد بنعلي', guardianProfession: 'موظف', guardianPhone: '0611111111',
    familyStatus: 'وسط_عادي', maritalStatus: 'عازب',
    healthStatus: 'جيدة', disabilityType: '', healthCoverage: 'AMO',
    transportMode: 'حافلة', hasFixedIncome: true, receivesSocialSupport: false,
    residenceArea: 'حضري', isWorking: false, currentJob: '', notes: '',
    createdAt: now, updatedAt: now
  },
  {
    id: uuidv4(), fullName: 'فاطمة الزهراء المنصوري', birthDate: '2001-07-22', birthPlace: 'سلا',
    address: 'حي التضامن، سلا', cinNumber: 'CD789012', phone: '0623456789',
    educationLevel: 'bac', stillStudying: false, otherTraining: false,
    desiredFiliere: 'assistant-social', filiereId: 'assistant-social', enrollmentYear: '2024',
    isDropout: false, dropoutDate: '', dropoutReason: '',
    guardianName: 'عبد الله المنصوري', guardianProfession: 'تاجر', guardianPhone: '0622222222',
    familyStatus: 'وسط_عادي', maritalStatus: 'عازب',
    healthStatus: 'جيدة', disabilityType: '', healthCoverage: 'CNSS',
    transportMode: 'تاكسي', hasFixedIncome: true, receivesSocialSupport: false,
    residenceArea: 'حضري', isWorking: false, currentJob: '', notes: '',
    createdAt: now, updatedAt: now
  },
  {
    id: uuidv4(), fullName: 'يوسف الحسناوي', birthDate: '1999-11-08', birthPlace: 'تمارة',
    address: 'حي الرياض، تمارة', cinNumber: 'EF345678', phone: '0634567890',
    educationLevel: '7eme', stillStudying: false, otherTraining: false,
    desiredFiliere: 'informatique', filiereId: 'informatique', enrollmentYear: '2024',
    isDropout: false, dropoutDate: '', dropoutReason: '',
    guardianName: 'حسن الحسناوي', guardianProfession: 'فلاح', guardianPhone: '0633333333',
    familyStatus: 'يتيم_الأب', maritalStatus: 'عازب',
    healthStatus: 'جيدة', disabilityType: '', healthCoverage: 'SANS',
    transportMode: 'مشيا', hasFixedIncome: false, receivesSocialSupport: true,
    residenceArea: 'شبه_حضري', isWorking: true, currentJob: 'عامل بناء', notes: '',
    createdAt: now, updatedAt: now
  },
  {
    id: uuidv4(), fullName: 'خديجة بوزيد', birthDate: '2002-05-30', birthPlace: 'الرباط',
    address: 'حي أكدال، الرباط', cinNumber: 'GH901234', phone: '0645678901',
    educationLevel: '9eme', stillStudying: false, otherTraining: false,
    desiredFiliere: 'assistant-roudh', filiereId: 'assistant-roudh', enrollmentYear: '2024',
    isDropout: true, dropoutDate: '2024-11-15', dropoutReason: 'ظروف عائلية',
    guardianName: 'عمر بوزيد', guardianProfession: 'سائق', guardianPhone: '0644444444',
    familyStatus: 'طلاق_الأبوين', maritalStatus: 'عازب',
    healthStatus: 'جيدة', disabilityType: '', healthCoverage: 'AMO',
    transportMode: 'حافلة', hasFixedIncome: false, receivesSocialSupport: true,
    residenceArea: 'حضري', isWorking: false, currentJob: '', notes: 'انقطعت بسبب ظروف عائلية',
    createdAt: now, updatedAt: now
  },
  {
    id: uuidv4(), fullName: 'عبد الرحيم الطاهري', birthDate: '2000-09-12', birthPlace: 'القنيطرة',
    address: 'حي الوفاء، القنيطرة', cinNumber: 'IJ567890', phone: '0656789012',
    educationLevel: '7eme', stillStudying: false, otherTraining: false,
    desiredFiliere: 'electricite-batiments', filiereId: 'electricite-batiments', enrollmentYear: '2024',
    isDropout: false, dropoutDate: '', dropoutReason: '',
    guardianName: 'إدريس الطاهري', guardianProfession: 'عامل', guardianPhone: '0655555555',
    familyStatus: 'وسط_عادي', maritalStatus: 'عازب',
    healthStatus: 'مرض_مزمن', disabilityType: '', healthCoverage: 'CNOPS',
    transportMode: 'حافلة', hasFixedIncome: true, receivesSocialSupport: false,
    residenceArea: 'قروي', isWorking: false, currentJob: '', notes: '',
    createdAt: now, updatedAt: now
  }
]

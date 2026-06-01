import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, WidthType, BorderStyle, AlignmentType, ShadingType, VerticalAlign
} from 'docx'
import { saveAs } from 'file-saver'

// ─── Page / margin constants (A4) ─────────────────────────────────────────────
const PAGE_W  = 11906
const MARGIN  = 900
const CONTENT = PAGE_W - MARGIN * 2   // 10106 DXA

// ─── Border presets ───────────────────────────────────────────────────────────
const B_NONE  = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
const B_THIN  = { style: BorderStyle.SINGLE, size: 4, color: 'AAAAAA' }
const B_BLACK = { style: BorderStyle.SINGLE, size: 6, color: '000000' }
const ALL_NONE = { top: B_NONE, bottom: B_NONE, left: B_NONE, right: B_NONE }
const ALL_THIN = { top: B_THIN, bottom: B_THIN, left: B_THIN, right: B_THIN }

// ─── Text helpers ─────────────────────────────────────────────────────────────
const R = (text, bold = false, size = 20, opts = {}) =>
  new TextRun({ text: text ?? '', bold, size, font: 'Arial', ...opts })

const Rar = (text, bold = false, size = 20, opts = {}) =>
  new TextRun({ text: text ?? '', bold, size, font: 'Arial', rightToLeft: true, ...opts })

const blank = (before = 0, after = 0) =>
  new Paragraph({ spacing: { before, after }, children: [R('')] })

// ─── RTL field line:  ■ label : value ────────────────────────────────────────
const fieldLine = (label, value = '') =>
  new Paragraph({
    bidirectional: true,
    alignment: AlignmentType.RIGHT,
    spacing: { before: 60, after: 60 },
    children: [
      Rar(value ? `${value}  ` : '  ', false, 20),
      Rar(':  ', false, 20),
      Rar(label, true, 20),
      Rar('  ■', true, 20),
    ],
  })

// ─── Section box (outer border) ───────────────────────────────────────────────
const sectionBox = (children) =>
  new Table({
    width: { size: CONTENT, type: WidthType.DXA },
    columnWidths: [CONTENT],
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: CONTENT, type: WidthType.DXA },
        borders: ALL_THIN,
        margins: { top: 80, bottom: 80, left: 160, right: 160 },
        children,
      })],
    })],
  })

// ─── Section title (bold underline, right-aligned) ───────────────────────────
const sectionTitle = (text) =>
  new Paragraph({
    bidirectional: true,
    alignment: AlignmentType.RIGHT,
    spacing: { before: 60, after: 100 },
    children: [new TextRun({
      text, bold: true, size: 22, font: 'Arial',
      rightToLeft: true,
      underline: { type: 'single' },
    })],
  })

// ─── Two-column row helper ────────────────────────────────────────────────────
const half = CONTENT - 320
const twoCol = (leftChildren, rightChildren) =>
  new Table({
    width: { size: half, type: WidthType.DXA },
    columnWidths: [Math.round(half * 0.50), Math.round(half * 0.50)],
    rows: [new TableRow({
      children: [
        new TableCell({
          width: { size: Math.round(half * 0.50), type: WidthType.DXA },
          borders: ALL_NONE,
          children: leftChildren,
        }),
        new TableCell({
          width: { size: Math.round(half * 0.50), type: WidthType.DXA },
          borders: ALL_NONE,
          children: rightChildren,
        }),
      ],
    })],
  })

const ltrPara = (runs, spacing = { before: 60, after: 60 }) =>
  new Paragraph({ alignment: AlignmentType.LEFT, spacing, children: runs })

const rtlPara = (runs, spacing = { before: 60, after: 60 }) =>
  new Paragraph({ bidirectional: true, alignment: AlignmentType.RIGHT, spacing, children: runs })

// ─── Section 3 – housing row ─────────────────────────────────────────────────
const econHousingRow = (sknValue, housing, incomeValue) => {
  const c1 = Math.round(CONTENT * 0.15)
  const c2 = Math.round(CONTENT * 0.15)
  const c3 = Math.round(CONTENT * 0.20)
  const c4 = Math.round(CONTENT * 0.35)
  const c5 = CONTENT - c1 - c2 - c3 - c4
  return new Table({
    width: { size: CONTENT, type: WidthType.DXA },
    columnWidths: [c1, c2, c3, c4, c5],
    rows: [new TableRow({
      children: [
        new TableCell({ width: { size: c1, type: WidthType.DXA }, borders: ALL_NONE,
          children: [rtlPara([Rar(incomeValue ?? '', false, 20)])] }),
        new TableCell({ width: { size: c2, type: WidthType.DXA }, borders: ALL_NONE,
          children: [rtlPara([Rar(':  معيل الأسرة', true, 20)])] }),
        new TableCell({ width: { size: c3, type: WidthType.DXA }, borders: ALL_NONE,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 }, children: [
            R(`${housing === 'كراء' ? '●' : '○'} كراء   `, false, 20),
            R(`${housing === 'ملك' ? '●' : '○'} ملك`, false, 20),
          ]})] }),
        new TableCell({ width: { size: c4, type: WidthType.DXA }, borders: ALL_NONE,
          children: [rtlPara([Rar(sknValue ?? '', false, 20)])] }),
        new TableCell({ width: { size: c5, type: WidthType.DXA }, borders: ALL_NONE,
          children: [rtlPara([Rar(':  سكن الأسرة  ■', true, 20)])] }),
      ],
    })],
  })
}

// ─── Main export ──────────────────────────────────────────────────────────────
export async function generateStudentWord(student, filiere, t) {
  const filName = filiere?.nameAr ?? '—'
  const F   = t('students.fields', { returnObjects: true })
  const yes = t('students.yes')
  const no  = t('students.no')

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: PAGE_W, height: 16838 },
          margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
        },
      },
      children: [

        // ── Header ───────────────────────────────────────────────────────────
        new Table({
          width: { size: CONTENT, type: WidthType.DXA },
          columnWidths: [
            Math.round(CONTENT * 0.18),
            Math.round(CONTENT * 0.64),
            Math.round(CONTENT * 0.18),
          ],
          rows: [new TableRow({
            children: [
              // Photo box
              new TableCell({
                width: { size: Math.round(CONTENT * 0.18), type: WidthType.DXA },
                borders: ALL_THIN,
                margins: { top: 0, bottom: 0, left: 0, right: 0 },
                verticalAlign: VerticalAlign.CENTER,
                children: [blank(400), blank(400), blank(400)],
              }),
              // Centre title
              new TableCell({
                width: { size: Math.round(CONTENT * 0.64), type: WidthType.DXA },
                borders: ALL_NONE,
                margins: { top: 60, bottom: 60, left: 120, right: 120 },
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
                    children: [R('[ التعاون الوطني - الشعار ]', false, 18, { color: 'AAAAAA' })] }),
                  new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 60 },
                    children: [Rar('مركز التكوين المهني بالتدرج الحسن الأول', false, 22)] }),
                  blank(60),
                  new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: 'بطاقة معلومات المتدرج(ة)', bold: true, size: 26,
                      font: 'Arial', rightToLeft: true, underline: { type: 'single' } })] }),
                ],
              }),
              // Logo placeholder
              new TableCell({
                width: { size: Math.round(CONTENT * 0.18), type: WidthType.DXA },
                borders: ALL_NONE,
                children: [blank()],
              }),
            ],
          })],
        }),

        blank(80),

        // ── Meta fields ──────────────────────────────────────────────────────
        new Table({
          width: { size: CONTENT, type: WidthType.DXA },
          columnWidths: [Math.round(CONTENT * 0.55), Math.round(CONTENT * 0.45)],
          rows: [new TableRow({
            children: [
              new TableCell({ width: { size: Math.round(CONTENT * 0.55), type: WidthType.DXA },
                borders: ALL_NONE, children: [blank()] }),
              new TableCell({ width: { size: Math.round(CONTENT * 0.45), type: WidthType.DXA },
                borders: ALL_NONE,
                children: [
                  fieldLine('الشعبة',        filName),
                  fieldLine('رقم التسجيل',   student.registrationNumber ?? ''),
                  fieldLine('تاريخ التسجيل', student.enrollmentYear ?? ''),
                ],
              }),
            ],
          })],
        }),

        blank(80),

        // ══ SECTION 1 ════════════════════════════════════════════════════════
        sectionBox([
          sectionTitle('1- معلومات شخصية:'),

          twoCol(
            [ltrPara([R(student.fullName ?? '', false, 20), R('   Nom et prénom  :', false, 20)])],
            [rtlPara([Rar(':  الاسم الكامل', true, 20), Rar('  ■', true, 20)])]
          ),

          twoCol(
            [ltrPara([R(student.birthPlace ?? '', false, 20), R('  :', false, 20),
              new TextRun({ text: '  مكان الازدياد', bold: true, size: 20, font: 'Arial', underline: { type: 'single' } })])],
            [rtlPara([Rar(student.birthDate ?? '', false, 20), Rar(':  تاريخ الازدياد', true, 20), Rar('  ■', true, 20)])]
          ),

          twoCol(
            [ltrPara([R(student.address ?? '', false, 20), R('   ADRESSE  :', false, 20)])],
            [rtlPara([Rar(':  العنوان الشخصي', true, 20), Rar('  ■', true, 20)])]
          ),

          fieldLine('رقم البطاقة الوطنية', student.cinNumber ?? ''),

          twoCol(
            [ltrPara([R(student.guardianPhone ?? '', false, 20), R('  :  هاتف والي الأمر', true, 20)])],
            [rtlPara([Rar(student.phone ?? '', false, 20), Rar(':  هاتف المتدرج(ة)', true, 20), Rar('  ■', true, 20)])]
          ),

          twoCol(
            [ltrPara([R(student.dropoutYear ?? '', false, 20), R('  :  التوقف عن التمدرس', true, 20)])],
            [rtlPara([Rar(student.educationLevel ?? '', false, 20), Rar(':  المستوى الدراسي', true, 20), Rar('  ■', true, 20)])]
          ),
        ]),

        blank(100),

        // ══ SECTION 2 ════════════════════════════════════════════════════════
        sectionBox([
          sectionTitle('2- معلومات حول الوضعية الاجتماعية والصحية:'),

          twoCol(
            [ltrPara([R(t(`students.familyStatus.${student.familyStatus}`) ?? '', false, 20), R('  :  الحالة العائلية', true, 20)])],
            [rtlPara([Rar(t(`students.maritalStatus.${student.maritalStatus}`) ?? '', false, 20), Rar(':  الوضعية الأسرية', true, 20), Rar('  ■', true, 20)])]
          ),

          twoCol(
            [ltrPara(['CNSS', 'CNOPS', 'AMO', 'SANS'].map(o =>
              new TextRun({ text: `  ${student.healthCoverage === o ? '●' : '○'} ${o}`,
                size: 20, font: 'Arial', bold: student.healthCoverage === o })
            ))],
            [rtlPara([Rar(':  التغطية الصحية', true, 20), Rar('  ■', true, 20)])]
          ),

          fieldLine('التسجيل في السجل الاجتماعي الموحد',
            student.receivesSocialSupport ? yes : no),
        ]),

        blank(100),

        // ══ SECTION 3 ════════════════════════════════════════════════════════
        sectionBox([
          sectionTitle('3- معلومات حول الوضعية الاقتصادية:'),

          fieldLine('وسط الإقامة', t(`students.residenceArea.${student.residenceArea}`) ?? ''),

          econHousingRow(
            student.housingType ?? '',
            student.housingOwnership ?? '',
            student.familySupport ?? ''
          ),

          twoCol(
            [ltrPara([R(student.guardianProfession ?? '', false, 20), R('  :  المهنة', true, 20)])],
            [rtlPara([Rar(student.guardianName ?? '', false, 20), Rar(':  اسم معيل الأسرة', true, 20), Rar('  ■', true, 20)])]
          ),

          fieldLine('مكان العمل', student.currentJob ?? ''),
        ]),

        blank(200),

        // ── Signatures ────────────────────────────────────────────────────────
        new Table({
          width: { size: CONTENT, type: WidthType.DXA },
          columnWidths: [
            Math.round(CONTENT / 3),
            Math.round(CONTENT / 3),
            CONTENT - Math.round(CONTENT / 3) * 2,
          ],
          rows: [
            new TableRow({
              children: ['توقيع المسؤول', 'توقيع ولي الأمر', 'توقيع المتدرج(ة)'].map((s, i) => {
                const w = i < 2 ? Math.round(CONTENT / 3) : CONTENT - Math.round(CONTENT / 3) * 2
                return new TableCell({
                  width: { size: w, type: WidthType.DXA },
                  borders: ALL_NONE,
                  children: [new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER,
                    children: [Rar(s, true, 20)] })],
                })
              }),
            }),
            new TableRow({
              height: { value: 1000, rule: 'exact' },
              children: [0, 1, 2].map((i) => {
                const w = i < 2 ? Math.round(CONTENT / 3) : CONTENT - Math.round(CONTENT / 3) * 2
                return new TableCell({
                  width: { size: w, type: WidthType.DXA },
                  borders: { top: B_NONE, left: B_NONE, right: B_NONE, bottom: B_BLACK },
                  children: [blank()],
                })
              }),
            }),
          ],
        }),
      ],
    }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `استمارة-${(student.fullName ?? 'مجهول').replace(/\s+/g, '-')}.docx`)
}

"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

/* ------------------------------------------------------------------ */
/* Vietnamese-capable font (Roboto from Google Fonts CDN)              */
/* ------------------------------------------------------------------ */
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
      fontWeight: 300,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf",
      fontWeight: 500,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: 700,
    },
  ],
});

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */
const colors = {
  black: "#000000",
  darkGray: "#333333",
  mediumGray: "#64748b",
  lightGray: "#f1f5f9",
  sectionBg: "#f3f4f6",
  border: "#d1d5db",
  white: "#ffffff",
};

const s = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 10,
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 36,
    color: colors.darkGray,
    lineHeight: 1.5,
  },

  /* ---- Header ---- */
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: 700,
    textTransform: "uppercase",
    color: colors.black,
  },
  clinicSub: { fontSize: 9, color: colors.mediumGray },
  headerRight: { textAlign: "right", fontSize: 9 },
  headerRightBold: { fontWeight: 700 },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: colors.black,
    marginTop: 8,
    marginBottom: 14,
  },
  mainTitle: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 2,
  },
  mainSubtitle: {
    textAlign: "center",
    fontSize: 10,
    color: colors.mediumGray,
    marginBottom: 16,
  },

  /* ---- Section container ---- */
  section: { marginTop: 12, borderWidth: 1, borderColor: colors.border },
  sectionHeader: {
    backgroundColor: colors.sectionBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sectionHeaderText: {
    fontWeight: 700,
    fontSize: 10,
    textTransform: "uppercase",
    color: colors.black,
  },
  sectionBody: { padding: 12 },

  /* ---- Info grid (2 cols) ---- */
  infoGrid: { flexDirection: "row", flexWrap: "wrap" },
  infoCell: { width: "50%", flexDirection: "row", marginBottom: 6 },
  infoCellFull: { width: "100%", flexDirection: "row", marginBottom: 6 },
  infoLabel: { fontWeight: 500, color: colors.darkGray, marginRight: 4 },
  infoValue: { color: colors.black },

  /* ---- Text blocks ---- */
  fieldLabel: { fontWeight: 500, color: colors.mediumGray, marginBottom: 2 },
  fieldValue: {
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#e2e8f0",
    color: colors.darkGray,
    marginBottom: 8,
  },

  /* ---- Table ---- */
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.border },
  tableHeader: { backgroundColor: colors.sectionBg },
  tableCell: {
    paddingVertical: 5,
    paddingHorizontal: 6,
    fontSize: 9,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  tableCellLast: {
    paddingVertical: 5,
    paddingHorizontal: 6,
    fontSize: 9,
  },
  tableCellBold: { fontWeight: 700 },
  tableCellCenter: { textAlign: "center" },

  /* ---- Footer / Signature ---- */
  sigRow: { flexDirection: "row", marginTop: 28, gap: 30 },
  sigCol: { flex: 1, alignItems: "center" },
  sigDate: { fontSize: 9, marginBottom: 4 },
  sigTitle: { fontWeight: 700, fontSize: 10, textTransform: "uppercase", marginBottom: 2 },
  sigNote: { fontSize: 8, color: colors.mediumGray },
  sigSpace: { height: 60 },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 24,
  },
  qrBox: {
    width: 70,
    height: 70,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  qrLabel: { fontSize: 7, textAlign: "center", marginTop: 3, color: colors.mediumGray },
  bottomRight: { textAlign: "right", fontSize: 8, color: colors.mediumGray },
  diagnosisRow: { flexDirection: "row", marginBottom: 6, width: "50%" },

  /* ---- Misc ---- */
  italic: { fontStyle: "italic" },
  prescriptionNotesBox: {
    backgroundColor: "#fafafa",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 8,
    marginTop: 6,
  },
  followUpRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderTopStyle: "dashed",
    paddingTop: 6,
    marginTop: 6,
    alignItems: "center",
  },
});

/* ------------------------------------------------------------------ */
/* Props – same shape as examination-print-preview.tsx                 */
/* ------------------------------------------------------------------ */
export interface PrescriptionItem {
  medicineName: string;
  quantity: string;
  unit: string;
  dosage: string;
  notes?: string;
}

export interface SpecialtyField {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
}

export interface MedicalRecordPdfProps {
  patient: {
    name?: string;
    patientCode?: string;
    id?: string;
    gender?: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
  };
  symptoms: string;
  physicalExam: string;
  examinationNotes: string;
  diagnosis: string;
  icdCode: string;
  treatment: string;
  followUpDate: string;
  prescriptionItems: PrescriptionItem[];
  prescriptionNotes: string;
  specialtyFields?: SpecialtyField[];
  specialtyExamValues?: Record<string, any>;
  doctorName?: string;
  specialtyName?: string;
  appointmentDate?: string;
  timeSlot?: string;
  emrCode?: string;
}

/* ------------------------------------------------------------------ */
/* Document                                                            */
/* ------------------------------------------------------------------ */
export default function MedicalRecordPdfDocument(props: MedicalRecordPdfProps) {
  const {
    patient,
    symptoms,
    physicalExam,
    examinationNotes,
    diagnosis,
    icdCode,
    treatment,
    followUpDate,
    prescriptionItems,
    prescriptionNotes,
    specialtyFields = [],
    specialtyExamValues = {},
    doctorName,
    specialtyName,
    appointmentDate,
    timeSlot,
    emrCode,
  } = props;

  const now = new Date();
  const formattedDate = `Ngày ${pad(now.getDate())} tháng ${pad(now.getMonth() + 1)} năm ${now.getFullYear()}`;
  const examDateDisplay = appointmentDate
    ? new Date(appointmentDate + "T00:00:00").toLocaleDateString("vi-VN")
    : now.toLocaleDateString("vi-VN");

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ==================== Header ==================== */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.clinicName}>MEDICORE CLINIC</Text>
            <Text style={s.clinicSub}>Hệ thống hồ sơ bệnh án điện tử</Text>
          </View>
          <View style={s.headerRight}>
            <Text>
              Mã BN: <Text style={s.headerRightBold}>{patient.patientCode || patient.id || ""}</Text>
            </Text>
            {emrCode && (
              <Text>
                Mã hồ sơ: <Text style={s.headerRightBold}>{emrCode}</Text>
              </Text>
            )}
            <Text>Ngày khám: {examDateDisplay}</Text>
            {timeSlot && <Text>Giờ khám: {timeSlot}</Text>}
          </View>
        </View>

        <View style={s.divider} />

        <Text style={s.mainTitle}>PHIẾU KHÁM NGOẠI TRÚ</Text>
        <Text style={s.mainSubtitle}>Outpatient Medical Examination Form</Text>

        {/* ==================== I. Thông tin bệnh nhân ==================== */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionHeaderText}>I. Thông tin bệnh nhân</Text>
          </View>
          <View style={s.sectionBody}>
            <View style={s.infoGrid}>
              <View style={s.infoCell}>
                <Text style={s.infoLabel}>Họ tên:</Text>
                <Text style={s.infoValue}>{patient.name || ""}</Text>
              </View>
              <View style={s.infoCell}>
                <Text style={s.infoLabel}>Mã BN:</Text>
                <Text style={s.infoValue}>{patient.patientCode || patient.id || ""}</Text>
              </View>
              <View style={s.infoCell}>
                <Text style={s.infoLabel}>Giới tính:</Text>
                <Text style={s.infoValue}>{patient.gender === "M" ? "Nam" : "Nữ"}</Text>
              </View>
              <View style={s.infoCell}>
                <Text style={s.infoLabel}>Điện thoại:</Text>
                <Text style={s.infoValue}>{patient.phone || ""}</Text>
              </View>
              <View style={s.infoCellFull}>
                <Text style={s.infoLabel}>Địa chỉ:</Text>
                <Text style={s.infoValue}>{patient.address || ""}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ==================== II. Triệu chứng & Khám lâm sàng ==================== */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionHeaderText}>II. Triệu chứng & Khám lâm sàng</Text>
          </View>
          <View style={s.sectionBody}>
            <Text style={s.fieldLabel}>Triệu chứng chính:</Text>
            <Text style={s.fieldValue}>{symptoms || "................................................"}</Text>
            <Text style={s.fieldLabel}>Kết quả khám lâm sàng thể chất:</Text>
            <Text style={s.fieldValue}>{physicalExam || "................................................"}</Text>
          </View>
        </View>

        {/* ==================== III. Khám chuyên khoa ==================== */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionHeaderText}>
              III. Khám chuyên khoa{specialtyName ? `: ${specialtyName.toUpperCase()}` : ""}
            </Text>
          </View>
          <View style={s.sectionBody}>
            {specialtyFields && specialtyFields.length > 0 ? (
              <View style={s.infoGrid}>
                {specialtyFields.map((field) => {
                  const value = specialtyExamValues?.[field.id];
                  const isEmpty = value === undefined || value === null || String(value).trim() === "";
                  let displayValue = "";
                  if (!isEmpty) {
                    if (field.type === "checkbox") {
                      displayValue = value === true ? "Có" : "Không";
                    } else {
                      displayValue = String(value);
                    }
                  } else {
                    displayValue = field.type === "checkbox" ? "Không" : "................................................";
                  }

                  if (field.type === "textarea") {
                    return (
                      <View key={field.id} style={{ width: "100%", marginTop: 4, marginBottom: 6 }}>
                        <Text style={s.fieldLabel}>{field.label}:</Text>
                        <Text style={s.fieldValue}>{isEmpty ? "................................................" : displayValue}</Text>
                      </View>
                    );
                  }

                  return (
                    <View key={field.id} style={s.infoCell}>
                      <Text style={s.infoLabel}>{field.label}:</Text>
                      <Text style={s.infoValue}>{displayValue}</Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={[s.italic, { color: colors.mediumGray, fontSize: 9 }]}>
                Không có chỉ định khám chuyên khoa riêng.
              </Text>
            )}
          </View>
        </View>

        {/* ==================== IV. Chẩn đoán ==================== */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionHeaderText}>IV. Chẩn đoán</Text>
          </View>
          <View style={s.sectionBody}>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              <View style={s.diagnosisRow}>
                <Text style={s.infoLabel}>ICD-10:</Text>
                <Text style={s.infoValue}>{icdCode || "................................"}</Text>
              </View>
              <View style={s.diagnosisRow}>
                <Text style={s.infoLabel}>Chẩn đoán bệnh chính:</Text>
                <Text style={s.infoValue}>{diagnosis || "................................"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ==================== V. Điều trị & Đơn thuốc ==================== */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionHeaderText}>V. Điều trị & Đơn thuốc</Text>
          </View>
          <View style={s.sectionBody}>
            <Text style={s.fieldLabel}>Chỉ định điều trị & Lời dặn:</Text>
            <Text style={s.fieldValue}>
              {treatment || "........................................................"}
            </Text>

            <Text style={[s.fieldLabel, { marginTop: 4 }]}>Đơn thuốc kèm theo:</Text>

            {/* Prescription Table */}
            <View style={{ borderWidth: 1, borderColor: colors.border, marginTop: 4 }}>
              {/* Header row */}
              <View style={[s.tableRow, s.tableHeader]} fixed>
                <Text style={[s.tableCell, s.tableCellBold, { width: "7%" }]}>STT</Text>
                <Text style={[s.tableCell, s.tableCellBold, { width: "30%" }]}>Tên thuốc</Text>
                <Text style={[s.tableCell, s.tableCellBold, s.tableCellCenter, { width: "12%" }]}>ĐVT</Text>
                <Text style={[s.tableCell, s.tableCellBold, s.tableCellCenter, { width: "10%" }]}>SL</Text>
                <Text style={[s.tableCell, s.tableCellBold, { width: "23%" }]}>Liều dùng</Text>
                <Text style={[s.tableCellLast, s.tableCellBold, { width: "18%" }]}>Ghi chú</Text>
              </View>
              {/* Data rows */}
              {prescriptionItems.length === 0 ? (
                <View style={s.tableRow}>
                  <Text style={[s.tableCellLast, { width: "100%", textAlign: "center", color: colors.mediumGray, paddingVertical: 14 }]}>
                    Chưa kê đơn thuốc
                  </Text>
                </View>
              ) : (
                prescriptionItems.map((item, index) => (
                  <View key={index} style={s.tableRow}>
                    <Text style={[s.tableCell, s.tableCellCenter, { width: "7%" }]}>{index + 1}</Text>
                    <Text style={[s.tableCell, { width: "30%", fontWeight: 500 }]}>{item.medicineName}</Text>
                    <Text style={[s.tableCell, s.tableCellCenter, { width: "12%" }]}>{item.unit}</Text>
                    <Text style={[s.tableCell, s.tableCellCenter, { width: "10%" }]}>{item.quantity}</Text>
                    <Text style={[s.tableCell, { width: "23%" }]}>{item.dosage}</Text>
                    <Text style={[s.tableCellLast, { width: "18%" }]}>{item.notes || "-"}</Text>
                  </View>
                ))
              )}
            </View>

            {/* Prescription notes */}
            <View style={s.prescriptionNotesBox}>
              <Text style={s.fieldLabel}>Hướng dẫn sử dụng thuốc:</Text>
              <Text style={{ color: colors.darkGray }}>
                {prescriptionNotes || "........................................................"}
              </Text>
            </View>

            {/* Follow up */}
            {followUpDate ? (
              <View style={s.followUpRow}>
                <Text style={s.infoLabel}>Hẹn tái khám vào ngày:</Text>
                <Text style={[s.infoValue, { fontWeight: 500 }]}>
                  {new Date(followUpDate + "T00:00:00").toLocaleDateString("vi-VN")}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ==================== VI. Ghi chú của bác sĩ ==================== */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionHeaderText}>VI. Ghi chú của bác sĩ</Text>
          </View>
          <View style={[s.sectionBody, { minHeight: 50 }]}>
            <Text style={{ color: colors.darkGray }}>
              {examinationNotes || "........................................................"}
            </Text>
          </View>
        </View>

        {/* ==================== Signature ==================== */}
        <View style={s.sigRow}>
          <View style={s.sigCol}>
            <Text style={[s.sigDate, { color: colors.white }]}>{formattedDate}</Text>
            <Text style={s.sigTitle}>Bệnh nhân</Text>
            <Text style={s.sigNote}>(Ký và ghi rõ họ tên)</Text>
            <View style={s.sigSpace} />
          </View>
          <View style={s.sigCol}>
            <Text style={s.sigDate}>{formattedDate}</Text>
            <Text style={s.sigTitle}>Bác sĩ điều trị</Text>
            <Text style={s.sigNote}>(Ký và ghi rõ họ tên)</Text>
            <View style={s.sigSpace} />
            {doctorName && <Text style={{ fontSize: 9, fontWeight: 500 }}>{doctorName}</Text>}
          </View>
        </View>

        {/* ==================== Bottom ==================== */}
        <View style={s.bottomRow}>
          <View>
            <View style={s.qrBox}>
              <Text style={{ fontSize: 8, color: colors.mediumGray }}>QR CODE</Text>
            </View>
            <Text style={s.qrLabel}>Tra cứu hồ sơ</Text>
          </View>
          <View style={s.bottomRight}>
            <Text>MediCore Electronic Medical Record</Text>
            <Text>Generated at {now.toLocaleString("vi-VN")}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

/* ---- helpers ---- */
function pad(n: number): string {
  return String(n).padStart(2, "0");
}

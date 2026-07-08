package com.medicore.service.clinical;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.medicore.common.constants.ErrorCodes;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.entity.clinical.Appointment;
import com.medicore.entity.clinical.MedicalRecord;
import com.medicore.entity.clinical.PrescriptionDetail;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class MedicalRecordPdfService {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public byte[] generate(MedicalRecord record, List<PrescriptionDetail> details) {
        try {
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, output);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);

            Paragraph clinic = new Paragraph("MEDICORE CLINIC", boldFont);
            clinic.setAlignment(Element.ALIGN_CENTER);
            document.add(clinic);

            Paragraph title = new Paragraph("PHIEU KHAM NGOAI TRU", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(12);
            document.add(title);

            addInfoTable(document, record, normalFont, boldFont);

            // I. TRIỆU CHỨNG & KHÁM LÂM SÀNG
            addSection(document, "I. TRIEU CHUNG & KHAM LAM SANG", sectionFont);
            addText(document, "Trieu chung chinh", record.getSymptoms(), normalFont, boldFont);
            addText(document, "Kham lam sang the chat", record.getPhysicalExamination(), normalFont, boldFont);
            addText(document, "Ket qua can lam sang", record.getTestResults(), normalFont, boldFont);

            // II. KHÁM CHUYÊN KHOA
            String specialtyName = "";
            if (record.getDoctor() != null && record.getDoctor().getSpecialty() != null) {
                specialtyName = record.getDoctor().getSpecialty().getSpecialtyName();
            }
            addSection(document, "II. KHAM CHUYEN KHOA" + (StringUtils.hasText(specialtyName) ? ": " + specialtyName.toUpperCase() : ""), sectionFont);
            addSpecialtyData(document, record.getAdditionalData(), normalFont, boldFont);

            // III. CHẨN ĐOÁN
            addSection(document, "III. CHAN DOAN", sectionFont);
            String diagnosis = record.getDiagnosisIcd10() == null
                    ? record.getMainDiagnosis()
                    : record.getDiagnosisIcd10().getIcd10Code() + " - " + record.getDiagnosisIcd10().getDiseaseName();
            addText(document, "Ma ICD-10", diagnosis, normalFont, boldFont);
            addText(document, "Chan doan benh chinh", record.getMainDiagnosis(), normalFont, boldFont);

            // IV. ĐIỀU TRỊ & ĐƠN THUỐC
            addSection(document, "IV. DIEU TRI & DON THUOC", sectionFont);
            addText(document, "Chi dinh dieu tri & Loi dan", record.getCareAdvice(), normalFont, boldFont);
            
            // Đơn thuốc kèm theo
            Paragraph prescLabel = new Paragraph("Don thuoc kem theo:", boldFont);
            prescLabel.setSpacingBefore(4);
            prescLabel.setSpacingAfter(4);
            document.add(prescLabel);
            
            addPrescriptionTable(document, details, normalFont, boldFont);

            // Hướng dẫn sử dụng thuốc (prescriptionNotes)
            String prescriptionNotes = "";
            if (record.getAdditionalData() != null) {
                Object notesObj = record.getAdditionalData().get("prescriptionNotes");
                if (notesObj instanceof String) {
                    prescriptionNotes = (String) notesObj;
                }
            }
            addText(document, "Huong dan su dung thuoc", prescriptionNotes, normalFont, boldFont);

            // Hẹn tái khám
            addText(document, "Hen tai kham vao ngay", record.getFollowUpDate() == null ? null : record.getFollowUpDate().format(DATE_FORMATTER), normalFont, boldFont);

            // V. GHI CHÚ CỦA BÁC SĨ
            addSection(document, "V. GHI CHU CUA BAC SI", sectionFont);
            addText(document, "Ghi chu lam sang", record.getClinicalNote(), normalFont, boldFont);
            addText(document, "Tom tat tien su", record.getHistorySummary(), normalFont, boldFont);

            document.close();
            return output.toByteArray();
        } catch (Exception ex) {
            throw new CustomBusinessException(ErrorCodes.INTERNAL_SERVER_ERROR, "Không thể tạo PDF hồ sơ khám");
        }
    }

    private void addInfoTable(Document document, MedicalRecord record, Font normalFont, Font boldFont) throws Exception {
        Appointment appointment = record.getAppointment();
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingAfter(12);
        table.addCell(cell("Ma ho so", boldFont));
        table.addCell(cell(value(record.getEmrCode()), normalFont));
        table.addCell(cell("Benh nhan", boldFont));
        table.addCell(cell(value(record.getPatient() == null ? null : record.getPatient().getFullName()), normalFont));
        table.addCell(cell("Ma benh nhan", boldFont));
        table.addCell(cell(value(record.getPatient() == null ? null : record.getPatient().getPatientCode()), normalFont));
        table.addCell(cell("Bac si", boldFont));
        table.addCell(cell(value(record.getDoctor() == null ? null : record.getDoctor().getDoctorName()), normalFont));
        table.addCell(cell("Ngay kham", boldFont));
        table.addCell(cell(appointment == null || appointment.getAppointmentDate() == null ? "" : appointment.getAppointmentDate().format(DATE_FORMATTER), normalFont));
        table.addCell(cell("Gio kham", boldFont));
        table.addCell(cell(value(appointment == null ? null : appointment.getTimeSlot()), normalFont));
        document.add(table);
    }

    private void addSection(Document document, String title, Font font) throws Exception {
        Paragraph paragraph = new Paragraph(title, font);
        paragraph.setSpacingBefore(8);
        paragraph.setSpacingAfter(6);
        document.add(paragraph);
    }

    private void addText(Document document, String label, String text, Font normalFont, Font boldFont) throws Exception {
        if (!StringUtils.hasText(text)) {
            return;
        }
        Paragraph paragraph = new Paragraph();
        paragraph.add(new Phrase(label + ": ", boldFont));
        paragraph.add(new Phrase(text, normalFont));
        paragraph.setSpacingAfter(4);
        document.add(paragraph);
    }

    private void addPrescriptionTable(Document document, List<PrescriptionDetail> details, Font normalFont, Font boldFont) throws Exception {
        if (details == null || details.isEmpty()) {
            document.add(new Paragraph("Khong co don thuoc", normalFont));
            return;
        }
        PdfPTable table = new PdfPTable(new float[]{1, 4, 2, 2, 5});
        table.setWidthPercentage(100);
        table.addCell(cell("STT", boldFont));
        table.addCell(cell("Thuoc", boldFont));
        table.addCell(cell("DVT", boldFont));
        table.addCell(cell("SL", boldFont));
        table.addCell(cell("Lieu dung", boldFont));
        for (int i = 0; i < details.size(); i++) {
            PrescriptionDetail detail = details.get(i);
            table.addCell(cell(String.valueOf(i + 1), normalFont));
            table.addCell(cell(value(detail.getMedicine() == null ? null : detail.getMedicine().getMedicineName()), normalFont));
            table.addCell(cell(value(detail.getMedicine() == null ? null : detail.getMedicine().getUnit()), normalFont));
            table.addCell(cell(detail.getQuantity() == null ? "" : String.valueOf(detail.getQuantity()), normalFont));
            table.addCell(cell(value(detail.getDosageInstruction()), normalFont));
        }
        document.add(table);
    }

    private void addSpecialtyData(Document document, Map<String, Object> additionalData, Font normalFont, Font boldFont) throws Exception {
        Map<String, Object> specialtyExamValues = null;
        List<Map<String, Object>> fields = null;

        if (additionalData != null) {
            Object valuesObj = additionalData.get("specialtyExamValues");
            if (valuesObj instanceof Map) {
                specialtyExamValues = (Map<String, Object>) valuesObj;
            }

            Object templateObj = additionalData.get("specialtyExamTemplate");
            if (templateObj instanceof Map) {
                Map<String, Object> templateMap = (Map<String, Object>) templateObj;
                Object fieldsObj = templateMap.get("fields");
                if (fieldsObj instanceof List) {
                    fields = (List<Map<String, Object>>) fieldsObj;
                }
            }
        }

        if (fields != null && !fields.isEmpty()) {
            for (Map<String, Object> field : fields) {
                String fieldId = String.valueOf(field.get("id"));
                String fieldLabel = String.valueOf(field.get("label"));
                String fieldType = String.valueOf(field.get("type"));

                Object value = specialtyExamValues != null ? specialtyExamValues.get(fieldId) : null;
                boolean isEmpty = value == null || String.valueOf(value).trim().isEmpty();

                String displayValue;
                if (!isEmpty) {
                    if ("checkbox".equalsIgnoreCase(fieldType)) {
                        displayValue = (Boolean.TRUE.equals(value) || "true".equalsIgnoreCase(String.valueOf(value))) ? "Co" : "Khong";
                    } else {
                        displayValue = String.valueOf(value);
                    }
                } else {
                    displayValue = "checkbox".equalsIgnoreCase(fieldType) ? "Khong" : "................................................";
                }

                addText(document, fieldLabel, displayValue, normalFont, boldFont);
            }
        } else {
            Paragraph noSpecialty = new Paragraph("Khong co chi dinh kham chuyen khoa rieng.", normalFont);
            noSpecialty.setSpacingAfter(4);
            document.add(noSpecialty);
        }
    }

    private PdfPCell cell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(value(text), font));
        cell.setPadding(5);
        return cell;
    }

    private String value(String text) {
        return text == null ? "" : text;
    }
}

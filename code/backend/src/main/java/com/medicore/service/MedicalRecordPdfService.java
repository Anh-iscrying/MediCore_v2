package com.medicore.service;

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
            addSection(document, "I. TRIEU CHUNG & KHAM LAM SANG", sectionFont);
            addText(document, "Trieu chung", record.getSymptoms(), normalFont, boldFont);
            addText(document, "Kham lam sang", record.getPhysicalExamination(), normalFont, boldFont);
            addText(document, "Ket qua can lam sang", record.getTestResults(), normalFont, boldFont);

            addSection(document, "II. CHAN DOAN", sectionFont);
            String diagnosis = record.getDiagnosisIcd10() == null
                    ? record.getMainDiagnosis()
                    : record.getDiagnosisIcd10().getIcd10Code() + " - " + record.getDiagnosisIcd10().getDiseaseName();
            addText(document, "Ma ICD-10", diagnosis, normalFont, boldFont);
            addText(document, "Chan doan chinh", record.getMainDiagnosis(), normalFont, boldFont);

            addSection(document, "III. DIEU TRI & TAI KHAM", sectionFont);
            addText(document, "Loi dan / dieu tri", record.getCareAdvice(), normalFont, boldFont);
            addText(document, "Ghi chu", record.getClinicalNote(), normalFont, boldFont);
            addText(document, "Tom tat tien su", record.getHistorySummary(), normalFont, boldFont);
            addText(document, "Ngay tai kham", record.getFollowUpDate() == null ? null : record.getFollowUpDate().format(DATE_FORMATTER), normalFont, boldFont);

            addSection(document, "IV. DON THUOC", sectionFont);
            addPrescriptionTable(document, details, normalFont, boldFont);

            if (record.getAdditionalData() != null && !record.getAdditionalData().isEmpty()) {
                addSection(document, "V. THONG TIN BO SUNG", sectionFont);
                addAdditionalData(document, record.getAdditionalData(), normalFont, boldFont);
            }

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

    private void addAdditionalData(Document document, Map<String, Object> data, Font normalFont, Font boldFont) throws Exception {
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            addText(document, entry.getKey(), entry.getValue() == null ? null : String.valueOf(entry.getValue()), normalFont, boldFont);
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

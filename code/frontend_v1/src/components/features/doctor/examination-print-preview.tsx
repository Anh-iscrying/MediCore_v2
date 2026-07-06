"use client";

import { Button } from "@/components/base/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { forwardRef } from "react";

interface PrescriptionItem {
    medicineName: string;
    quantity: string;
    unit: string;
    dosage: string;
    notes?: string;
}

interface Props {
    patient: any;
    symptoms: string;
    physicalExam: string;
    examinationNotes: string;
    diagnosis: string;
    icdCode: string;
    treatment: string;
    followUpDate: string;
    prescriptionItems: PrescriptionItem[];
    prescriptionNotes: string;
    specialtyFields?: any[];
    specialtyExamValues?: Record<string, any>;
    specialtyName?: string;


    onBack: () => void;
    onPrint: () => void;
}

export default function ExaminationPrintPreview({
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
    specialtyName = "",
    onBack,
    onPrint,
}: Props) {
    const now = new Date();
    const formattedDate = `Ngày ${String(now.getDate()).padStart(2, '0')} tháng ${String(now.getMonth() + 1).padStart(2, '0')} năm ${now.getFullYear()}`;

    return (
        <div className="flex flex-col items-center bg-slate-100 min-h-screen py-8">

            {/* Toolbar */}
            <div className="w-[210mm] flex justify-end gap-3 mb-5 print:hidden">

                <Button
                    variant="outline"
                    onClick={onBack}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>

                <Button
                    onClick={onPrint}
                >
                    <Printer className="w-4 h-4 mr-2" />
                    In PDF
                </Button>

            </div>

            {/* A4 */}
            <div
                id="print-area"
                className="
            bg-white
            w-[210mm]
            min-h-[297mm]
            shadow-lg
            p-10
            text-[14px]
            leading-6
        "
            >

                {/* ================= Header ================= */}

                <div className="flex justify-between">

                    <div>

                        <h2 className="text-xl font-bold uppercase">

                            MEDICORE CLINIC

                        </h2>

                        <p className="text-sm text-gray-500">

                            Hệ thống hồ sơ bệnh án điện tử

                        </p>

                    </div>

                    <div className="text-right text-sm">

                        <p>

                            Mã BN: <b>{patient.patientCode || patient.id}</b>

                        </p>

                        <p>

                            Ngày khám:{" "}

                            {new Date().toLocaleDateString("vi-VN")}

                        </p>

                    </div>

                </div>

                <div className="border-b-2 border-black mt-5 mb-8" />

                <h1 className="text-center text-3xl font-bold uppercase tracking-wider">

                    PHIẾU KHÁM NGOẠI TRÚ

                </h1>

                <p className="text-center text-gray-500 mt-2">

                    Outpatient Medical Examination Form

                </p>

                {/* ================= Thông tin ================= */}

                <div className="mt-10 border">

                    <div className="bg-gray-100 border-b px-4 py-2 font-bold uppercase">

                        I. Thông tin bệnh nhân

                    </div>

                    <div className="p-5">

                        <div className="grid grid-cols-2 gap-y-5 gap-x-10">

                            <div>

                                <span className="font-semibold">

                                    Họ tên:

                                </span>{" "}

                                {patient.name}

                            </div>

                            <div>

                                <span className="font-semibold">

                                    Mã BN:

                                </span>{" "}

                                {patient.patientCode || patient.id}

                            </div>

                            <div>

                                <span className="font-semibold">

                                    Giới tính:

                                </span>{" "}

                                {patient.gender === "M" ? "Nam" : "Nữ"}

                            </div>

                            <div>

                                <span className="font-semibold">

                                    Điện thoại:

                                </span>{" "}

                                {patient.phone}

                            </div>

                            <div className="col-span-2">

                                <span className="font-semibold">

                                    Địa chỉ:

                                </span>{" "}

                                {patient.address}

                            </div>

                        </div>

                    </div>

                </div>

                {/* ================= II. Triệu chứng & Khám lâm sàng ================= */}
                <div className="mt-7 border">
                    <div className="bg-gray-100 border-b px-4 py-2 font-bold uppercase">
                        II. Triệu chứng & Khám lâm sàng
                    </div>
                    <div className="p-5 space-y-4">
                        <div>
                            <span className="font-semibold text-gray-700">Triệu chứng chính:</span>
                            <div className="mt-1 whitespace-pre-wrap pl-3 border-l-2 border-gray-200 text-gray-800">
                                {symptoms || "................................................"}
                            </div>
                        </div>
                        <div className="pt-2">
                            <span className="font-semibold text-gray-700">Kết quả khám lâm sàng thể chất:</span>
                            <div className="mt-1 whitespace-pre-wrap pl-3 border-l-2 border-gray-200 text-gray-800">
                                {physicalExam || "................................................"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= III. Khám chuyên khoa ================= */}
                <div className="mt-7 border">
                    <div className="bg-gray-100 border-b px-4 py-2 font-bold uppercase">
                        III. Khám chuyên khoa{specialtyName ? `: ${specialtyName.toUpperCase()}` : ""}
                    </div>
                    <div className="p-5">
                        {specialtyFields && specialtyFields.length > 0 ? (
                            <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
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
                                            <div key={field.id} className="col-span-2 mt-1">
                                                <span className="font-semibold text-gray-700 block mb-1">{field.label}:</span>
                                                <div className="whitespace-pre-wrap pl-3 border-l-2 border-gray-200 text-gray-800 py-1">
                                                    {isEmpty ? "................................................" : displayValue}
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={field.id} className="flex gap-2 items-baseline">
                                            <span className="font-semibold text-gray-600 shrink-0">{field.label}:</span>
                                            <span className="border-b border-dotted border-gray-400 flex-grow leading-none pb-0.5">
                                                {displayValue}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-gray-400 text-sm italic">
                                Không có chỉ định khám chuyên khoa riêng.
                            </div>
                        )}
                    </div>
                </div>

                {/* ================= IV. Chẩn đoán ================= */}
                <div className="mt-7 border">
                    <div className="bg-gray-100 border-b px-4 py-2 font-bold uppercase">
                        IV. Chẩn đoán
                    </div>
                    <div className="p-5 space-y-4">
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <span className="font-semibold text-gray-700">ICD-10:</span>{" "}
                                <span className="text-gray-800">{icdCode || "................................"}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-700">Chẩn đoán bệnh chính:</span>{" "}
                                <span className="text-gray-800">{diagnosis || "................................"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= V. Điều trị & Đơn thuốc ================= */}
                <div className="mt-7 border">
                    <div className="bg-gray-100 border-b px-4 py-2 font-bold uppercase">
                        V. Điều trị & Đơn thuốc
                    </div>
                    <div className="p-5 space-y-4">
                        <div>
                            <span className="font-semibold text-gray-700">Chỉ định điều trị & Lời dặn:</span>
                            <div className="mt-1 whitespace-pre-wrap pl-3 border-l-2 border-gray-200 text-gray-800">
                                {treatment || "........................................................"}
                            </div>
                        </div>

                        <div className="pt-2">
                            <span className="font-semibold text-gray-700 block mb-2">Đơn thuốc kèm theo:</span>
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="border p-2 w-12 text-left">STT</th>
                                        <th className="border p-2 text-left">Tên thuốc</th>
                                        <th className="border p-2 w-20 text-center">ĐVT</th>
                                        <th className="border p-2 w-20 text-center">SL</th>
                                        <th className="border p-2 text-left">Liều dùng</th>
                                        <th className="border p-2 text-left">Ghi chú</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prescriptionItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="border p-8 text-center text-gray-400">
                                                Chưa kê đơn thuốc
                                            </td>
                                        </tr>
                                    ) : (
                                        prescriptionItems.map((item, index) => (
                                            <tr key={index}>
                                                <td className="border p-2 text-center">{index + 1}</td>
                                                <td className="border p-2 font-medium">{item.medicineName}</td>
                                                <td className="border p-2 text-center">{item.unit}</td>
                                                <td className="border p-2 text-center">{item.quantity}</td>
                                                <td className="border p-2">{item.dosage}</td>
                                                <td className="border p-2">{item.notes || "-"}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            <div className="border-t p-3 bg-gray-50/50 mt-2">
                                <span className="font-semibold text-gray-700">Hướng dẫn sử dụng thuốc:</span>
                                <div className="mt-1 whitespace-pre-wrap text-gray-800">
                                    {prescriptionNotes || "........................................................"}
                                </div>
                            </div>
                        </div>

                        {followUpDate && (
                            <div className="pt-2 border-t border-dashed border-gray-200 flex items-center gap-2">
                                <span className="font-semibold text-gray-700">Hẹn tái khám vào ngày:</span>
                                <span className="text-gray-800 font-medium">
                                    {new Date(followUpDate).toLocaleDateString("vi-VN")}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ================= VI. Ghi chú của bác sĩ ================= */}
                <div className="mt-7 border">
                    <div className="bg-gray-100 border-b px-4 py-2 font-bold uppercase">
                        VI. Ghi chú của bác sĩ
                    </div>
                    <div className="p-5 min-h-[90px] whitespace-pre-wrap text-gray-800">
                        {examinationNotes || "........................................................"}
                    </div>
                </div>
                {/* ================= Footer ================= */}

                <div className="mt-12">

                    <div className="grid grid-cols-2 gap-10">

                        {/* Bệnh nhân */}

                        <div className="text-center">

                            <p className="invisible">

                                {formattedDate}

                            </p>

                            <p className="font-semibold uppercase mt-2">

                                Bệnh nhân

                            </p>

                            <p className="text-xs text-gray-500 mt-1">

                                (Ký và ghi rõ họ tên)

                            </p>

                            <div className="h-24"></div>

                        </div>

                        {/* Bác sĩ */}

                        <div className="text-center">

                            <p>

                                {formattedDate}

                            </p>

                            <p className="font-semibold uppercase mt-2">

                                Bác sĩ điều trị

                            </p>

                            <p className="text-xs text-gray-500 mt-1">

                                (Ký và ghi rõ họ tên)

                            </p>

                            <div className="h-24"></div>

                        </div>

                    </div>

                </div>

                {/* ================= QR + Footer ================= */}

                <div className="mt-12 flex justify-between items-end">

                    <div>

                        <div className="w-28 h-28 border flex items-center justify-center">

                            QR CODE

                        </div>

                        <p className="text-xs text-center mt-2">

                            Tra cứu hồ sơ

                        </p>

                    </div>

                    <div className="text-right text-xs text-gray-500">

                        <p>

                            MediCore Electronic Medical Record

                        </p>

                        <p>

                            Generated at{" "}
                            {new Date().toLocaleString("vi-VN")}

                        </p>

                    </div>

                </div>

            </div>

        </div>

    );


}
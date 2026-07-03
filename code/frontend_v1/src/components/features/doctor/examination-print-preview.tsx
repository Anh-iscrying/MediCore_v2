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
    testResults: string;
    examinationNotes: string;
    diagnosis: string;
    icdCode: string;
    treatment: string;
    followUpDate: string;
    prescriptionItems: PrescriptionItem[];
    prescriptionNotes: string;

    onBack: () => void;
    onPrint: () => void;
}

export default function ExaminationPrintPreview({
    patient,
    symptoms,
    physicalExam,
    testResults,
    examinationNotes,
    diagnosis,
    icdCode,
    treatment,
    followUpDate,
    prescriptionItems,
    prescriptionNotes,
    onBack,
    onPrint,
}: Props) {
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

                            Mã BN: <b>{patient.id}</b>

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

                                {patient.id}

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

                {/* ================= Triệu chứng ================= */}

                <div className="mt-7 border">

                    <div className="bg-gray-100 border-b px-4 py-2 font-bold uppercase">

                        II. Triệu chứng

                    </div>

                    <div className="p-5 min-h-[90px] whitespace-pre-wrap">

                        {symptoms || "................................................"}

                    </div>

                </div>

                {/* ================= Khám ================= */}

                <div className="mt-7 border">

                    <div className="bg-gray-100 border-b px-4 py-2 font-bold uppercase">

                        III. Khám lâm sàng

                    </div>

                    <div className="p-5 min-h-[90px] whitespace-pre-wrap">

                        {physicalExam || "................................................"}

                    </div>

                </div>
                {/* ================= Cận lâm sàng ================= */}

                <div className="mt-7 border">

                    <div className="bg-gray-100 border-b px-4 py-2 font-bold uppercase">

                        IV. Cận lâm sàng

                    </div>

                    <div className="p-5 min-h-[90px] whitespace-pre-wrap">

                        {testResults || "................................................"}

                    </div>

                </div>

                {/* ================= Chẩn đoán ================= */}

                <div className="mt-7 border">

                    <div className="bg-gray-100 border-b px-4 py-2 font-bold uppercase">

                        V. Chẩn đoán

                    </div>

                    <div className="p-5 space-y-4">

                        <div className="grid grid-cols-2 gap-5">

                            <div>

                                <span className="font-semibold">

                                    ICD-10:

                                </span>{" "}

                                {icdCode || "................................"}

                            </div>

                            <div>

                                <span className="font-semibold">

                                    Kết luận:

                                </span>{" "}

                                {diagnosis || "................................"}

                            </div>

                        </div>

                    </div>

                </div>

                {/* ================= Đơn thuốc ================= */}

                <div className="mt-7 border">

                    <div className="bg-gray-100 border-b px-4 py-2 font-bold uppercase">

                        VI. Đơn thuốc

                    </div>

                    <table className="w-full text-sm border-collapse">

                        <thead>

                            <tr className="bg-gray-50">

                                <th className="border p-2 w-12">
                                    STT
                                </th>

                                <th className="border p-2">
                                    Tên thuốc
                                </th>

                                <th className="border p-2 w-20">
                                    ĐVT
                                </th>

                                <th className="border p-2 w-20">
                                    SL
                                </th>

                                <th className="border p-2">
                                    Liều dùng
                                </th>

                                <th className="border p-2">
                                    Ghi chú
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {prescriptionItems.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan={6}
                                        className="border p-8 text-center text-gray-400"
                                    >

                                        Chưa kê đơn thuốc

                                    </td>

                                </tr>

                            ) : (

                                prescriptionItems.map((item, index) => (

                                    <tr key={index}>

                                        <td className="border p-2 text-center">

                                            {index + 1}

                                        </td>

                                        <td className="border p-2">

                                            {item.medicineName}

                                        </td>

                                        <td className="border p-2 text-center">

                                            {item.unit}

                                        </td>

                                        <td className="border p-2 text-center">

                                            {item.quantity}

                                        </td>

                                        <td className="border p-2">

                                            {item.dosage}

                                        </td>

                                        <td className="border p-2">

                                            {item.notes || "-"}

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                    <div className="border-t p-4">

                        <span className="font-semibold">

                            Hướng dẫn sử dụng thuốc:

                        </span>

                        <div className="mt-2 whitespace-pre-wrap">

                            {prescriptionNotes ||
                                "........................................................"}

                        </div>

                    </div>

                </div>

                {/* ================= Điều trị ================= */}

                <div className="mt-7 border">

                    <div className="bg-gray-100 border-b px-4 py-2 font-bold uppercase">

                        VII. Điều trị

                    </div>

                    <div className="p-5 min-h-[90px] whitespace-pre-wrap">

                        {treatment ||
                            "........................................................"}

                    </div>

                </div>

                {/* ================= Ghi chú ================= */}

                <div className="mt-7 border">

                    <div className="bg-gray-100 border-b px-4 py-2 font-bold uppercase">

                        VIII. Ghi chú của bác sĩ

                    </div>

                    <div className="p-5 min-h-[90px] whitespace-pre-wrap">

                        {examinationNotes ||
                            "........................................................"}

                    </div>

                </div>
                {/* ================= Footer ================= */}

                <div className="mt-12">

                    <div className="grid grid-cols-2 gap-10">

                        {/* Bệnh nhân */}

                        <div className="text-center">

                            <p className="font-semibold uppercase">

                                Bệnh nhân

                            </p>

                            <p className="text-xs text-gray-500 mt-1">

                                (Ký và ghi rõ họ tên)

                            </p>

                            <div className="h-24"></div>

                            <div className="border-t border-black w-52 mx-auto"></div>

                        </div>

                        {/* Bác sĩ */}

                        <div className="text-center">

                            <p>

                                Ngày ...... tháng ...... năm ......

                            </p>

                            <p className="font-semibold uppercase mt-2">

                                Bác sĩ điều trị

                            </p>

                            <p className="text-xs text-gray-500 mt-1">

                                (Ký và ghi rõ họ tên)

                            </p>

                            <div className="h-24"></div>

                            <div className="border-t border-black w-52 mx-auto"></div>

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
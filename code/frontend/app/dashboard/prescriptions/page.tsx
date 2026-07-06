import { cn } from "@/lib/utils"

const prescriptions = [
  {
    visit: "18 Th06 2026 • Khoa Tim mạch",
    doctor: "Dr. Sarah Jenkins",
    status: "ĐANG DÙNG",
    medicines: [
      { name: "Amlodipine", dosage: "5mg", frequency: "1 lần / ngày", duration: "30 ngày", instruction: "Uống sau ăn sáng" },
      { name: "Atorvastatin", dosage: "10mg", frequency: "1 lần / ngày (buổi tối)", duration: "30 ngày", instruction: "Uống trước khi đi ngủ" }
    ]
  },
  {
    visit: "20 Th05 2026 • Khoa Đa khoa",
    doctor: "Dr. Alex Rivera",
    status: "LỊCH SỬ",
    medicines: [
      { name: "Metformin", dosage: "500mg", frequency: "2 lần / ngày", duration: "30 ngày", instruction: "Uống trực tiếp trong bữa ăn" }
    ]
  }
]

export default function PrescriptionsPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-4 md:p-8 select-none">

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <article className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-sans font-black text-foreground">2 đơn thuốc đang hoạt động</h2>
          <p className="mt-2 text-sm text-muted-foreground">Kê theo đợt khám tim mạch gần đây nhất.</p>
        </article>
        <article className="rounded-xl border border-border bg-card p-6 md:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-sans font-black text-foreground">Thao tác đơn thuốc</h2>
              <p className="mt-1 text-sm text-muted-foreground">Tải file PDF hoặc in ấn đơn thuốc điện tử.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button className="rounded-xl border border-[#0e0f0c] bg-card px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#0e0f0c] hover:bg-background transition-colors cursor-pointer">
                Tải PDF
              </button>
              <button className="rounded-xl border border-[#0e0f0c] bg-card px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#0e0f0c] hover:bg-background transition-colors cursor-pointer">
                In đơn thuốc
              </button>
            </div>
          </div>
        </article>
      </section>

      <section className="space-y-6">
        {prescriptions.map((prescription) => (
          <article key={prescription.visit} className="rounded-xl border border-border bg-card p-6">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div>
                  <h2 className="text-2xl font-sans font-black text-foreground tracking-tight">{prescription.visit}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Bác sĩ kê toa: {prescription.doctor}</p>
                </div>
              </div>
              <span className={cn(
                "w-max rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                prescription.status === "ĐANG DÙNG"
                  ? "border-[#2ead4b]/20 bg-[#e2f6d5] text-[#054d28]"
                  : "border-border bg-secondary text-muted-foreground"
              )}>
                {prescription.status}
              </span>
            </div>

            <div className="space-y-3">
              {prescription.medicines.map((medicine) => (
                <div key={medicine.name} className="rounded-xl border border-border bg-background p-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tên thuốc</p>
                      <p className="mt-1 text-sm font-black text-foreground">{medicine.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Liều lượng</p>
                      <p className="mt-1 text-sm font-black text-foreground">{medicine.dosage}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tần suất</p>
                      <p className="mt-1 text-sm font-black text-foreground">{medicine.frequency}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Thời hạn sử dụng</p>
                      <p className="mt-1 text-sm font-black text-foreground">{medicine.duration}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hướng dẫn cách dùng</p>
                      <p className="mt-1 text-sm font-black text-foreground">{medicine.instruction}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}


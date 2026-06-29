// No icons needed

const cardShadow = { boxShadow: "0px 2px 4px rgba(0,0,0,0.2), 0px 8px 16px -4px rgba(0,0,0,0.4)" }

const visits = [
  {
    date: "18 Th06 2026",
    doctor: "Dr. Sarah Jenkins",
    specialty: "Tim mạch",
    diagnosis: "Cao huyết áp vô căn",
    treatment: "Tiếp tục sử dụng thuốc huyết áp theo toa, duy trì chế độ ăn giảm muối, hạn chế dầu mỡ và tái khám sau 4 tuần.",
    note: "Vui lòng tự theo dõi và ghi lại nhật ký huyết áp mỗi ngày trước đợt khám kế tiếp."
  },
  {
    date: "03 Th06 2026",
    doctor: "Dr. Emily Watson",
    specialty: "Vật lý trị liệu",
    diagnosis: "Phục hồi khớp gối sau chấn thương",
    treatment: "Thực hiện bài tập phục hồi chức năng khớp gối theo hướng dẫn nâng dần độ vận động.",
    note: "Tránh các hoạt động nhảy, chạy hoặc mang vác vật nặng cho đến khi khớp gối hồi phục hoàn toàn."
  },
  {
    date: "20 Th05 2026",
    doctor: "Dr. Alex Rivera",
    specialty: "Đa khoa",
    diagnosis: "Khám định kỳ tiểu đường tuýp 2",
    treatment: "Duy trì uống Metformin theo đơn, tự đo đường huyết mao mạch mỗi tuần và ghi lại nhật ký.",
    note: "Thực hiện xét nghiệm máu tổng quát (HbA1c) trước lịch hẹn khám kế tiếp."
  }
]

export default function MedicalHistoryPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-4 md:p-8">

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className="rounded-lg border border-[#e6dfd8] bg-[#efe9de] p-6 lg:col-span-2" style={cardShadow}>
          <div className="flex items-center gap-3 rounded-md border border-[#e6dfd8] bg-[#faf9f5] px-4 py-3 text-[#6c6a64]">
            <span className="text-sm font-semibold">Tìm kiếm đợt khám, chẩn đoán, bác sĩ... (Chỉ mô phỏng)</span>
          </div>
        </article>

        <article className="rounded-lg border border-[#e6dfd8] bg-[#efe9de] p-6" style={cardShadow}>
          <h2 className="text-xl font-serif font-medium text-foreground">{visits.length} đợt khám bệnh</h2>
          <p className="mt-2 text-sm text-[#6c6a64]">Hồ sơ bệnh án được đồng bộ từ dữ liệu của bệnh viện.</p>
        </article>
      </section>

      <section className="space-y-4">
        {visits.map((visit, index) => (
          <article key={`${visit.date}-${visit.doctor}`} className="rounded-lg border border-[#e6dfd8] bg-[#efe9de] p-6" style={cardShadow}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#6c6a64]">{visit.date}</p>
                  <h2 className="mt-2 text-2xl font-serif font-medium text-foreground">{visit.diagnosis}</h2>
                  <p className="mt-1 text-sm text-[#6c6a64]">{visit.doctor} • Khoa {visit.specialty}</p>
                </div>
              </div>
              <button className="w-full rounded-md border border-[#e6dfd8] bg-[#faf9f5] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#141413] hover:bg-[#efe9de] hover:border-white md:w-auto cursor-pointer transition-colors">
                Chi tiết đợt khám
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-[#e6dfd8] bg-[#faf9f5] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#6c6a64]">Hướng dẫn điều trị</p>
                <p className="mt-2 text-sm leading-relaxed text-[#3d3d3a]">{visit.treatment}</p>
              </div>
              <div className="rounded-lg border border-[#e6dfd8] bg-[#faf9f5] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#6c6a64]">Ghi chú & Tái khám</p>
                <p className="mt-2 text-sm leading-relaxed text-[#3d3d3a]">{visit.note}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}


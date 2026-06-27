// No icons needed

const cardShadow = { boxShadow: "0px 2px 4px rgba(0,0,0,0.2), 0px 8px 16px -4px rgba(0,0,0,0.4)" }

const profileFields = [
  { label: "Mã bệnh nhân", value: "PT-2026-0148" },
  { label: "Họ và tên", value: "Alexander Carter" },
  { label: "Ngày sinh", value: "14 Th03 1988" },
  { label: "Giới tính", value: "Nam" }
]

const contactFields = [
  { label: "Số điện thoại", value: "+1 (555) 014-0921" },
  { label: "Email liên hệ", value: "alexander.carter@email.com" },
  { label: "Địa chỉ thường trú", value: "28 West Lake Street, Seattle, WA" },
  { label: "Nghề nghiệp", value: "Quản lý sản phẩm" }
]

export default function PatientProfilePage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-4 md:p-8">

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className="rounded-lg border border-[#cc785c] bg-[#cc785c] p-6 text-white" style={cardShadow}>
          <h2 className="text-2xl font-serif font-medium">Hồ sơ hoàn thành 80%</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/95">Vui lòng cập nhật đầy đủ thông tin dị ứng thuốc và người liên hệ khẩn cấp để hoàn tất hồ sơ.</p>
          <button className="mt-5 rounded-md bg-[#faf9f5] border border-[#faf9f5] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#cc785c] hover:bg-[#efe9de] transition-colors cursor-pointer">
            Chỉnh sửa hồ sơ
          </button>
        </article>

        <article className="rounded-lg border border-[#e6dfd8] bg-[#efe9de] p-6 lg:col-span-2" style={cardShadow}>
          <div className="mb-5">
            <h2 className="text-xl font-serif font-medium text-foreground">Thông tin định danh</h2>
            <p className="text-sm text-[#6c6a64] mt-0.5">Thông tin đăng ký cơ bản của bệnh nhân.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {profileFields.map((field) => (
              <div key={field.label} className="rounded-lg border border-[#e6dfd8] bg-[#faf9f5] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#6c6a64]">{field.label}</p>
                <p className="mt-1 text-sm font-bold text-foreground">{field.value}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article className="rounded-lg border border-[#e6dfd8] bg-[#efe9de] p-6" style={cardShadow}>
          <div className="mb-5">
            <h2 className="text-xl font-serif font-medium text-foreground">Thông tin liên hệ</h2>
          </div>
          <div className="space-y-3">
            {contactFields.map((field) => (
              <div key={field.label} className="flex items-start justify-between gap-4 border-b border-[#e6dfd8] pb-3 last:border-0 last:pb-0">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6c6a64]">{field.label}</span>
                <span className="text-right text-sm font-semibold text-foreground">{field.value}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-[#e6dfd8] bg-[#efe9de] p-6" style={cardShadow}>
          <div className="mb-5">
            <h2 className="text-xl font-serif font-medium text-foreground">Người liên hệ khẩn cấp</h2>
          </div>
          <div className="rounded-lg border border-[#e6dfd8] bg-[#faf9f5] p-4">
            <p className="text-sm font-bold text-foreground">Maria Carter</p>
            <p className="mt-1 text-sm text-[#6c6a64]">Vợ • +1 (555) 019-4472</p>
          </div>
          <button className="mt-5 rounded-md border border-[#e6dfd8] bg-[#faf9f5] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#141413] hover:bg-[#efe9de] hover:border-white cursor-pointer transition-colors">
            Cập nhật liên hệ
          </button>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article className="rounded-lg border border-[#e6dfd8] bg-[#efe9de] p-6" style={cardShadow}>
          <div className="mb-5">
            <h2 className="text-xl font-serif font-medium text-foreground">Bệnh nền & Tiền sử bệnh án</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Cao huyết áp', 'Tiểu đường tuýp 2', 'Phục hồi chức năng gối'].map((item) => (
              <span key={item} className="rounded-full border border-[#e6dfd8] bg-[#faf9f5] px-3 py-1.5 text-xs font-semibold text-[#3d3d3a]">{item}</span>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-[#e6dfd8] bg-[#efe9de] p-6" style={cardShadow}>
          <div className="mb-5">
            <h2 className="text-xl font-serif font-medium text-foreground">Dị ứng thuốc đã biết</h2>
          </div>
          <div className="space-y-3">
            {['Penicillin', 'Nhạy cảm với Ibuprofen'].map((item) => (
              <div key={item} className="rounded-md border border-[#e8a55a]/30 bg-[#faf9f5] p-3 text-sm font-semibold text-[#e8a55a] shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}



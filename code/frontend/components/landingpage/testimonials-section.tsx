"use client"

const patientStories = [
  {
    quote: "Quy trình đặt lịch rõ ràng. Tôi biết cần chuẩn bị giấy tờ gì trước khi đến khám nên buổi khám diễn ra nhanh hơn.",
    author: "Người bệnh khám Tim mạch",
  },
  {
    quote: "Bác sĩ giải thích dễ hiểu, lịch tái khám được nhắc lại trong cổng bệnh nhân. Gia đình tôi theo dõi thuận tiện hơn.",
    author: "Phụ huynh bệnh nhi",
  },
  {
    quote: "Thông tin lần khám trước được lưu lại gọn gàng. Khi tái khám, tôi không phải kể lại mọi thứ từ đầu.",
    author: "Người bệnh tái khám",
  },
]

export function PatientStoriesSection() {
  return (
    <section id="patient-stories" className="scroll-mt-24 border-t border-border bg-background py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="mb-4 max-w-max rounded-full bg-card px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-border">
            Trải nghiệm người bệnh
          </p>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-foreground md:text-5xl">
            Nhẹ hơn ở từng bước chăm sóc
          </h2>
          <p className="mt-5 text-base leading-8 text-foreground/65">
            Những phản hồi này được biên tập ngắn gọn để mô tả trải nghiệm sử dụng hệ thống, không thay thế tư vấn y khoa.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {patientStories.map((story) => (
            <figure key={story.author} className="flex min-h-[260px] flex-col justify-between rounded-[24px] bg-card p-7 ring-1 ring-border">
              <blockquote className="text-xl font-semibold leading-8 tracking-tight text-foreground">
                “{story.quote}”
              </blockquote>
              <figcaption className="mt-8 border-t border-border pt-5 text-sm font-semibold text-foreground/65">
                {story.author}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

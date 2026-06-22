import FadeIn from "../components/FadeIn";

const services = [
  {
    number: "01",
    name: "Store Builder",
    description:
      "We design and launch high-converting e-commerce stores from scratch — fast, clean, and built to sell from day one.",
  },
  {
    number: "02",
    name: "Winning Products",
    description:
      "Our squad researches trending and profitable products so you never waste money on items that don't move.",
  },
  {
    number: "03",
    name: "Customer Agents",
    description:
      "Real human agents plugged into your WhatsApp, Telegram, and Facebook — answering questions and closing sales 24/7.",
  },
  {
    number: "04",
    name: "Social Connect",
    description:
      "We integrate your store with your social channels so every message, comment, and inquiry becomes a sales opportunity.",
  },
  {
    number: "05",
    name: "Growth Strategy",
    description:
      "From pricing to paid ads to post-purchase flows — we build the full growth engine your store needs to scale.",
  },
];

export default function ServicesSection() {
  return (
    <section
      id="services"
      className="bg-white rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-28"
    >
      <FadeIn delay={0} y={40}>
        <h2
          className="text-[#0C0C0C] font-black uppercase text-center mb-16 sm:mb-20 md:mb-24"
          style={{ fontSize: "clamp(3rem, 8vw, 100px)" }}
        >
          What We Do
        </h2>
      </FadeIn>

      <div className="max-w-5xl mx-auto flex flex-col">
        {services.map((service, i) => (
          <FadeIn key={service.number} delay={i * 0.1} y={30}>
            <div
              className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 py-8 sm:py-10 md:py-12 ${
                i > 0 ? "border-t" : ""
              }`}
              style={{ borderColor: "rgba(12,12,12,0.15)" }}
            >
              <span
                className="text-[#0C0C0C] font-black flex-shrink-0"
                style={{ fontSize: "clamp(3rem, 7vw, 90px)" }}
              >
                {service.number}
              </span>
              <div className="flex flex-col gap-2">
                <h3
                  className="text-[#0C0C0C] font-medium uppercase"
                  style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.4rem)" }}
                >
                  {service.name}
                </h3>
                <p
                  className="text-[#0C0C0C] font-light leading-relaxed max-w-2xl opacity-60"
                  style={{ fontSize: "clamp(0.75rem, 1.2vw, 0.9rem)" }}
                >
                  {service.description}
                </p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

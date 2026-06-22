import FadeIn from "../components/FadeIn";

const team = [
  {
    name: "Jack",
    role: "Squad Leader",
    photo:
      "https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png",
    bio: "The visionary behind NexVend. Jack oversees strategy, client relationships, and makes sure the squad delivers every single time.",
  },
  {
    name: "Sofia Reyes",
    role: "Design Agent",
    photo: "https://k.top4top.io/p_3823b6zzr1.png",
    bio: "Sofia crafts stunning storefronts and brand identities that stop the scroll and turn visitors into buyers.",
  },
  {
    name: "Marcus Lee",
    role: "Tech Agent",
    photo: "https://d.top4top.io/p_382318j801.png",
    bio: "Marcus handles all integrations — from store setup to WhatsApp bots — making sure every tech piece runs flawlessly.",
  },
  {
    name: "Amir Hassan",
    role: "Marketing Agent",
    photo: "https://b.top4top.io/p_3823htijt1.png",
    bio: "Amir builds and runs paid ad campaigns across Meta and TikTok, turning ad spend into real measurable revenue.",
  },
  {
    name: "Yuna Park",
    role: "Customer Agent",
    photo: "https://d.top4top.io/p_38238hz7z1.png",
    bio: "Yuna manages live customer conversations across WhatsApp, Telegram, and Facebook — fast, friendly, and always converting.",
  },
  {
    name: "Leo Dumont",
    role: "Product Hunter",
    photo: "https://a.top4top.io/p_3823y9u641.png",
    bio: "Leo researches winning products obsessively — tracking trends, analyzing data, and surfacing only what's proven to sell.",
  },
];

export default function TeamSection() {
  return (
    <section
      id="team"
      className="bg-[#0C0C0C] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 relative z-10 px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-28"
    >
      <FadeIn delay={0} y={40}>
        <h2
          className="hero-heading font-black uppercase text-center mb-16 sm:mb-20 md:mb-24 text-white"
          style={{ fontSize: "clamp(3rem, 8vw, 100px)" }}
        >
          The Squad
        </h2>
      </FadeIn>

      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
        {team.map((member, i) => (
          <FadeIn key={member.name} delay={i * 0.12} y={30}>
            <div
              className="flex flex-col items-center p-6 rounded-[30px]"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(215,226,234,0.12)",
              }}
            >
              <img
                src={member.photo}
                alt={member.name}
                className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] object-cover rounded-full border-2 border-[#D7E2EA]/30 mx-auto mb-4"
                loading="lazy"
              />
              <h3
                className="text-[#D7E2EA] font-black uppercase text-center mb-2"
                style={{ fontSize: "clamp(0.95rem, 1.6vw, 1.25rem)" }}
              >
                {member.name}
              </h3>
              <span className="border border-[#D7E2EA]/30 text-[#D7E2EA]/60 font-light uppercase tracking-widest text-xs px-3 py-1 rounded-full mb-3 text-center">
                {member.role}
              </span>
              <p
                className="text-[#D7E2EA]/60 font-light text-center leading-relaxed"
                style={{ fontSize: "clamp(0.7rem, 1.1vw, 0.85rem)" }}
              >
                {member.bio}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

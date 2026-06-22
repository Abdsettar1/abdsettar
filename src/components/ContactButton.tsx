interface ContactButtonProps {
  className?: string;
  onClick?: () => void;
}

export default function ContactButton({ className = "", onClick }: ContactButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-full font-medium uppercase tracking-widest text-white inline-flex items-center justify-center cursor-pointer transition-transform hover:scale-[1.03] active:scale-[0.98] ${className}`}
      style={{
        background:
          "linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)",
        boxShadow:
          "0px 4px 4px rgba(181,1,167,0.25), 4px 4px 12px #7721B1 inset",
        outline: "2px solid white",
        outlineOffset: "-3px",
      }}
    >
      Contact Us
    </button>
  );
}

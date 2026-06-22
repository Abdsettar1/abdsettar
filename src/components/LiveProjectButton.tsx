interface LiveProjectButtonProps {
  className?: string;
  onClick?: () => void;
}

export default function LiveProjectButton({ className = "", onClick }: LiveProjectButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border-2 border-[#D7E2EA] text-[#D7E2EA] font-medium uppercase tracking-widest hover:bg-[#D7E2EA]/10 transition-colors cursor-pointer ${className}`}
    >
      Live Project
    </button>
  );
}

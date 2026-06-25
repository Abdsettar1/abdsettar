import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  // Split content by code blocks to separate code from text
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2.5 text-sm sm:text-[14px] leading-relaxed font-sans text-[#D7E2EA]/90 select-text">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          // Code block parsing
          const match = part.match(/```(\w*)\n([\s\S]*?)```/);
          const lang = match ? match[1] : "code";
          const code = match ? match[2].trim() : part.slice(3, -3).trim();
          return <CodeBlock key={index} language={lang} code={code} />;
        } else {
          // Parse paragraphs and basic inline elements
          const paragraphs = part.split(/\n\n+/);
          return (
            <div key={index} className="space-y-2">
              {paragraphs.map((p, pIdx) => {
                const trimmed = p.trim();
                if (!trimmed) return null;

                // Handle bullet list item
                if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                  const items = trimmed.split(/\n[*-]\s+/);
                  return (
                    <ul key={pIdx} className="list-disc pl-5 my-2.5 space-y-1.5 text-[#D7E2EA]/85">
                      {items.map((item, itemIdx) => {
                        const cleanItem = item.replace(/^[*-]\s+/, "");
                        return <li key={itemIdx}>{parseInlineMarkdown(cleanItem)}</li>;
                      })}
                    </ul>
                  );
                }

                // Handle headers
                if (trimmed.startsWith("### ")) {
                  return (
                    <h4 key={pIdx} className="text-sm font-semibold text-white tracking-wide uppercase mt-4 mb-2">
                      {parseInlineMarkdown(trimmed.replace(/^###\s+/, ""))}
                    </h4>
                  );
                }
                if (trimmed.startsWith("## ")) {
                  return (
                    <h3 key={pIdx} className="text-base font-bold text-white tracking-tight mt-4 mb-2">
                      {parseInlineMarkdown(trimmed.replace(/^##\s+/, ""))}
                    </h3>
                  );
                }

                return (
                  <p key={pIdx} className="whitespace-pre-wrap leading-relaxed">
                    {parseInlineMarkdown(p)}
                  </p>
                );
              })}
            </div>
          );
        }
      })}
    </div>
  );
}

// Sub-component for beautifully-styled Code Block with copy action
function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-white/10 bg-neutral-950 shadow-xl max-w-full font-mono text-xs select-text">
      {/* Code Block Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] border-b border-white/5 select-none">
        <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold font-mono">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[10px] text-white/50 hover:text-white transition-all bg-white/[0.02] hover:bg-white/[0.08] px-2.5 py-1 rounded-md border border-white/5 cursor-pointer active:scale-95"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-green-400" />
              <span className="text-green-400 font-semibold font-mono">COPIED</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="font-mono">COPY</span>
            </>
          )}
        </button>
      </div>
      {/* Code Content */}
      <div className="p-4 overflow-x-auto scrollbar-thin max-w-full">
        <pre className="text-pink-300 text-[13px] leading-relaxed font-mono select-text">
          <code className="font-mono">{code}</code>
        </pre>
      </div>
    </div>
  );
}

// Function to parse inline markdown (bold, italic, inline code)
function parseInlineMarkdown(text: string) {
  // Simple regex parsing for inline elements
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    } else if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-white/[0.06] border border-white/10 text-pink-400 font-mono text-xs select-text"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

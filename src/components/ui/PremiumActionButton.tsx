import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumActionButtonProps {
  onClick: () => void;
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  className?: string;
  disabled?: boolean;
  variant?: "cyan" | "red"; // Pour supporter le style "Stop Recording" éventuellement, ou juste cyan par défaut
}

export function PremiumActionButton({
  onClick,
  icon: Icon,
  title,
  subtitle,
  className,
  disabled = false,
  variant = "cyan",
}: PremiumActionButtonProps) {
  const colorHex = variant === "cyan" ? "6,182,212" : "239,68,68"; // rgb values for cyan-500 and red-500

  return (
    <div
      className={cn(
        "relative group cursor-pointer w-full max-w-md mx-auto",
        disabled && "opacity-50 pointer-events-none",
        className,
      )}
      onClick={onClick}
    >
      {/* Background Gradient & Glow */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-r rounded-xl blur-md group-hover:blur-lg transition-all duration-300 opacity-75",
          variant === "cyan"
            ? "from-cyan-500/20 to-blue-600/20"
            : "from-red-500/20 to-orange-600/20",
        )}
      />

      {/* Main Content */}
      <div
        className={cn(
          "relative h-16 md:h-20 rounded-xl overflow-hidden border bg-black/40 backdrop-blur-md flex items-center justify-center transition-all duration-300",
          variant === "cyan"
            ? "border-cyan-500/30 group-hover:border-cyan-500/50"
            : "border-red-500/30 group-hover:border-red-500/50",
        )}
      >
        {/* Decorative Background Elements */}
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />

        {/* Shine Effect */}
        <div
          className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(var(--shine-color),0.1)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-background-shine opacity-50"
          style={{ "--shine-color": colorHex } as React.CSSProperties}
        />

        {/* Glow Blobs */}
        <div
          className={cn(
            "absolute -left-10 -top-10 w-40 h-40 rounded-full blur-3xl",
            variant === "cyan" ? "bg-cyan-500/10" : "bg-red-500/10",
          )}
        />
        <div
          className={cn(
            "absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-3xl",
            variant === "cyan" ? "bg-blue-600/10" : "bg-orange-600/10",
          )}
        />

        {/* Text & Icon */}
        <div className="relative z-10 flex items-center gap-3 md:gap-4 px-4 md:px-6 w-full justify-center md:justify-start">
          <div
            className={cn(
              "p-2 md:p-3 rounded-full border transition-transform duration-300 group-hover:scale-110 shrink-0",
              variant === "cyan"
                ? "bg-cyan-500/20 border-cyan-500/50"
                : "bg-red-500/20 border-red-500/50",
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 md:h-6 md:w-6",
                variant === "cyan" ? "text-cyan-400" : "text-red-400",
              )}
            />
          </div>
          <div className="flex flex-col items-start min-w-0">
            <span className="text-base md:text-xl font-bold text-white tracking-wide text-glow truncate w-full text-left">
              {title}
            </span>
            {subtitle && (
              <span className="text-[10px] md:text-xs text-gray-400 font-mono uppercase tracking-wider truncate w-full text-left">
                {subtitle}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

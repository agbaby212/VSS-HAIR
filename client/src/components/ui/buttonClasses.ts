export type ButtonVariant = "primary" | "secondary" | "gold";
export type ButtonSize = "md" | "lg";

// min-h of 2.75rem = 44px, the smallest comfortable tap target
const base =
  "inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-full border-2 font-medium " +
  "transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  // For ivory pages. Hover edge is the foil (see .btn-foil-edge in index.css)
  primary: "btn-foil-edge border-transparent bg-cocoa text-ivory",
  secondary: "border-cocoa bg-transparent text-espresso hover:bg-sand",
  // For espresso sections. espresso on gold is 6.4:1
  gold: "border-transparent bg-gold text-espresso hover:bg-gold-light",
};

const sizes: Record<ButtonSize, string> = {
  md: "px-5 py-2.5 text-base",
  lg: "px-7 py-3.5 text-lg",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
}: { variant?: ButtonVariant; size?: ButtonSize } = {}): string {
  return `${base} ${variants[variant]} ${sizes[size]}`;
}
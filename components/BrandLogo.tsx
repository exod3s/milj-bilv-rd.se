import Image from "next/image";
import { clsx } from "clsx";

type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <span
      className={clsx(
        "relative inline-flex items-center justify-center overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-black/10",
        className
      )}
      aria-label="Miljö Bilvård logo"
    >
      <Image
        src="/logo.svg"
        alt="Miljö Bilvård"
        width={5000}
        height={5503}
        priority
        className="h-full w-full scale-125 object-contain p-1"
      />
    </span>
  );
}

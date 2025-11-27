"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface HeaderProps {
  back?: boolean;
  title?: string;
}

export default function Header({ back, title }: HeaderProps) {
  const pathname = usePathname();
  const showBack = back ?? (pathname !== "/" && pathname !== "/profile");

  return (
    <header className="bg-[#B37C3E] text-white relative py-3 flex items-center justify-center shadow-md">
      {showBack && (
        <Link
          href="/meals"
          className="absolute left-4 flex items-center gap-1 text-white/90 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Назад</span>
        </Link>
      )}

      <Image
        src="/avyra-logo.svg"
        alt="AVYRA"
        width={90}
        height={30}
        className="mx-auto"
      />

      {title && (
        <span className="absolute bottom-1 text-xs text-white/90">{title}</span>
      )}
    </header>
  );
}

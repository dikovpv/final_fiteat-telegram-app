'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Dumbbell,
  UtensilsCrossed,
  BookOpen,
  NotebookPen,
  Home,
} from "lucide-react";

interface NavLinkProps {
  href: string;
  icon: JSX.Element;
  label: string;
}

function NavLink({ href, icon, label }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`nav-item flex flex-col items-center text-[11px] transition-all duration-300 py-2 px-3 rounded-2xl border ${
        isActive
          ? "text-[var(--accent)] bg-[var(--accent-muted)] border-[var(--border-soft)] shadow-[var(--shadow-soft)]"
          : "text-[var(--text-muted)] border-transparent hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
      }`}
    >
      <motion.div
        className="w-6 h-6 mb-1"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
      >
        {icon}
      </motion.div>
      <span className="font-semibold leading-none">{label}</span>
    </Link>
  );
}

export default function Navigation() {
  return (
    <nav className="cosmic-nav fixed bottom-0 left-0 w-full py-2 px-4 flex justify-around z-50">
      <NavLink href="/" icon={<Home />} label="Главная" />
      <NavLink href="/meals" icon={<UtensilsCrossed />} label="Питание" />
      <NavLink href="/workouts" icon={<Dumbbell />} label="Тренировки" />
      <NavLink href="/diary" icon={<NotebookPen />} label="Дневник" />
      <NavLink href="/tips" icon={<BookOpen />} label="Советы" />
    </nav>
  );
}

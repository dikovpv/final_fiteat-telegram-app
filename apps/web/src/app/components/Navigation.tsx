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
import ThemeToggle from "./ThemeToggle";

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
      className={`nav-item flex flex-col items-center text-xs transition-all duration-300 py-2 px-3 rounded-lg ${
        isActive 
          ? "text-teal-400 bg-teal-400/10 scale-110" 
          : "text-gray-400 hover:text-teal-400 hover:bg-white/5"
      }`}
    >
      <motion.div 
        className="w-6 h-6 mb-1"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {icon}
      </motion.div>
      <span className="font-medium">{label}</span>
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
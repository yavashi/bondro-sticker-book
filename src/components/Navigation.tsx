"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Camera, Users, Sparkles } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "シール帳", icon: BookOpen },
    { href: "/scan", label: "撮影・登録", icon: Camera },
    { href: "/friends", label: "フレンド", icon: Users },
    { href: "/trade", label: "交換・ギフト", icon: Sparkles },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-pink-200 px-4 pt-2 pb-safe z-50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "text-pink-600 font-bold scale-105 bg-pink-50"
                  : "text-slate-400 hover:text-pink-400 font-medium"
              }`}
            >
              <div className="relative">
                <Icon
                  size={24}
                  className={isActive ? "stroke-[2.5px]" : "stroke-[1.8px]"}
                />
                {item.href === "/trade" && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500"></span>
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

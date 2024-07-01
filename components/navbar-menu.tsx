"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from 'next/navigation';
import { cn } from "@/utils/cn";
import TransitionLink from "@/components/transition-link";
import { animatePageIn, animatePageOut } from "@/utils/animations";

export function NavbarDemo() {
  useEffect(() => {
    animatePageIn();
  }, []);

  return (
    <div className="relative w-full flex items-center justify-center">
      <Navbar className="top-2" />
    </div>
  );
}

function Navbar({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [active, setActive] = useState<string | null>(null);
  const items = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Projects", path: "/projects" },
    { name: "Contact", path: "/contact" },
  ];

  useEffect(() => {
    // Set the active state based on the current path
    setActive(pathname);
  }, [pathname]);

  return (
    <div className={cn("pt-6 fixed top-10 inset-x-0 max-w-80 mx-auto z-50", className)}>
      <nav className="relative flex items-center justify-center space-x-2 bg-gray-800 rounded-xl p-2 shadow-lg">
        {items.map((item) => (
          <TransitionLink
            key={item.name}
            href={item.path}
            label={item.name}
            className={cn(
              "px-2 py-0.5 rounded-lg cursor-pointer transition-colors", 
              active === item.path ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
            )}
          />
        ))}
      </nav>
      <div id="banner-1" className="fixed top-0 left-0 w-full h-full z-40"></div>
      <div id="banner-2" className="fixed top-0 left-0 w-full h-full z-30"></div>
      <div id="banner-3" className="fixed top-0 left-0 w-full h-full z-20"></div>
      <div id="banner-4" className="fixed top-0 left-0 w-full h-full z-10"></div>
    </div>
  );
}

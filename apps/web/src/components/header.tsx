"use client";

import Link from "next/link";

import { ModeToggle } from "./mode-toggle";
import { Headphones } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b-0 bg-background/95 backdrop-blur">
      <div className="container flex h-14 max-w-4xl items-center justify-between px-4 mx-auto">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold text-foreground no-underline hover:opacity-90 active:opacity-80 transition-opacity duration-200"
        >
          <span
            className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground"
            aria-hidden
          >
            <Headphones className="size-4" />
          </span>
          <span className="hidden sm:inline tracking-tight">Article Explainer</span>
        </Link>
        <ModeToggle />
      </div>
      <div className="h-1 w-full bg-primary/90" aria-hidden />
    </header>
  );
}

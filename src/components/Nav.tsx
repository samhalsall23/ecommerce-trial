"use client";

import { ReactNode, ComponentProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function Nav({ children }: { children: ReactNode }) {
  return (
    <nav className="bg-primary text-primary-foreground flex justify-center">
      {children}
    </nav>
  );
}

export function NavLink(props: Omit<ComponentProps<typeof Link>, "className">) {
  const pathName = usePathname();
  return (
    <Link
      {...props}
      className={cn(
        "p-4 hover:bg-secondary hover:text-secondary-foreground focus-visible:bg-secondary focus=visible:text-secondary-foreground",
        pathName === props.href && "bg-secondary text-secondary-foreground"
      )}
    >
      {props.children}
    </Link>
  );
}

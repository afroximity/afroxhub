"use client";

import Link from "next/link";
import type { ReactNode, CSSProperties } from "react";

type Props = {
  href: string;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
};

export default function RoomLink({ href, children, style, className }: Props) {
  return (
    <Link
      href={href}
      style={style}
      className={className}
      onClick={() => sessionStorage.setItem("gc-from-hub", "1")}
    >
      {children}
    </Link>
  );
}

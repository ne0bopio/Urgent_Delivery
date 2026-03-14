"use client";

import dynamic from "next/dynamic";

const VanBackground = dynamic(
  () => import("@/components/VanBackground"),
  { ssr: false }
);

export default function VanBackgroundLazy() {
  return <VanBackground />;
}
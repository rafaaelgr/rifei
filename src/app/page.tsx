"use client";
import { Header } from "@/components/Header";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Header />
    </>
  );
}

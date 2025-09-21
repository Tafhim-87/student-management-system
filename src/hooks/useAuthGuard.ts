"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/signin");
    }
  }, [router]);
}

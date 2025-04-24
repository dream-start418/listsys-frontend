"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Ensure this runs only on the client
    setIsClient(true);

    const token = localStorage.getItem("listan_token");
    if (!token) {
      router.push("/auth/signin"); // Redirect to the signin page
    }
  }, [router]);

  if (!isClient) {
    return null; // Render nothing until the component is mounted on the client
  }

  return <>{children}</>;
}

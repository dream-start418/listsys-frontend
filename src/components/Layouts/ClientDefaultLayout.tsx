"use client";
import React, { useState, useEffect } from "react";
import ClientSidebar from "@/components/Sidebar/ClientSideBar";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";
import { useRouter } from "next/navigation";
import { isTokenValid } from "@/utils/TokenValidation";

export default function ClientDefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('listan_token');
    if (!token || !isTokenValid(token)) {
      console.log('Token is invalid or expired. Redirecting to sign-in...');
      localStorage.removeItem('listan_token'); // Clear invalid token
      router.push('/auth/signin'); // Redirect to sign-in page
    }
  }, [router]);
  return (
    <>
      <AuthGuard>
        {/* <!-- ===== Page Wrapper Start ===== --> */}
        <div className="flex">
          {/* <!-- ===== Sidebar Start ===== --> */}
          <ClientSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          {/* <!-- ===== Sidebar End ===== --> */}

          {/* <!-- ===== Content Area Start ===== --> */}
          <div className="relative flex flex-1 flex-col lg:ml-52">
            {/* <!-- ===== Header Start ===== --> */}
            {/* <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> */}
            {/* <!-- ===== Header End ===== --> */}

            {/* <!-- ===== Main Content Start ===== --> */}
            <main>
              <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                {children}
              </div>
            </main>
            {/* <!-- ===== Main Content End ===== --> */}
          </div>
          {/* <!-- ===== Content Area End ===== --> */}
        </div>
        {/* <!-- ===== Page Wrapper End ===== --> */}
      </AuthGuard>
    </>
  );
}

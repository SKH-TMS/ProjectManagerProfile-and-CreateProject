"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
export default function NavbarAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("userType"); // Clear userType from storage
    router.push("/adminData/LoginAdmin"); // Redirect to AdminLogin

    try {
      const response = await fetch("../../api/auth/logout", {
        method: "GET",
      });
      const data = await response.json();
      if (!data.success) {
        console.error("Error logging out:", data.message);
      }
      toast.success("Logout Sucessfully");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    // ✅ Check authentication status from sessionStorage
    const userType = sessionStorage.getItem("userType");
    setIsAuthenticated(userType === "Admin");
  }, []);

  return (
    <nav className="bg-teal-900 flex justify-between">
      <div>
        <Link href="/">Home</Link>
      </div>
      <div>
        {!isAuthenticated ? (
          <>
            <Link href="/adminData/RegisterAdmin">Admin Register</Link>
            <Link href="/adminData/LoginAdmin">Admin Login</Link>
          </>
        ) : (
          <>
            <Link href="/adminData/ProfileAdmin">Admin Profile</Link>

            <a className="cursor-pointer" onClick={handleLogout}>
              Logout
            </a>
          </>
        )}
      </div>
    </nav>
  );
}

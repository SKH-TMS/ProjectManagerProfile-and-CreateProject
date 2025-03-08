"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
export default function NavbarUser() {
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(false);
  const [isAuthenticatedPM, setIsAuthenticatedPM] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsAuthenticatedUser(false);
    setIsAuthenticatedPM(false);
    sessionStorage.removeItem("userType"); // Clear userType from storage
    router.push("/userData/LoginUser"); // Redirect to LoginUser

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
    // Check authentication status from sessionStorage
    const userType = sessionStorage.getItem("userType");
    if (userType === "User") {
      setIsAuthenticatedUser(true);
    } else if (userType === "ProjectManager") {
      setIsAuthenticatedPM(true);
    }
  }, []);

  return (
    <nav className="bg-blue-900 flex justify-between">
      <div>
        <Link href="/">Home</Link>
      </div>
      <div>
        {!isAuthenticatedUser && !isAuthenticatedPM ? (
          <>
            <Link href="/userData/RegisterUser">Register</Link>
            <Link href="/userData/LoginUser">Login</Link>
          </>
        ) : (
          <>
            {isAuthenticatedUser && !isAuthenticatedPM ? (
              <Link href="/userData/ProfileUser">Profile</Link>
            ) : null}
            {isAuthenticatedPM && !isAuthenticatedUser ? (
              <Link href="/projectManagerData/ProfileProjectManager">
                Profile
              </Link>
            ) : null}
            <a className="cursor-pointer" onClick={handleLogout}>
              Logout
            </a>
          </>
        )}
      </div>
    </nav>
  );
}

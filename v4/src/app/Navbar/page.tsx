"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticatedPM, setIsAuthenticatedPM] = useState(false);

  useEffect(() => {
    // Check if there's a token in cookies
    const token = document.cookie
      .split(";")
      .find((cookie) => cookie.trim().startsWith("token="));
    setIsAuthenticated(!!token); // Set authentication state based on token presence
    const userType = sessionStorage.getItem("userType");
    setIsAuthenticatedPM(userType === "ProjectManager");
  }, []);

  return (
    <nav className="flex justify-between">
      <div>
        <Link href="/">Home</Link>
      </div>
      <div>
        {!isAuthenticatedPM ? (
          <>
            <Link href="/userData/ProfileUser">User</Link>
          </>
        ) : (
          <>
            <Link href="/projectManagerData/ProfileProjectManager">User</Link>
          </>
        )}
        <Link href="/adminData/ProfileAdmin">Admin</Link>
      </div>
    </nav>
  );
}

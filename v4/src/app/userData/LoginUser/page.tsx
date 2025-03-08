"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NavbarUser from "../NavbarUser/page";
import { NextRequest } from "next/server";
import toast from "react-hot-toast";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Both email and password are required!");
      return;
    }

    try {
      const response = await fetch("../../api/userData/login_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
      });

      const data = await response.json();

      if (data.success) {
        // Check for  user or admin field
        // Store user type in sessionStorage
        sessionStorage.setItem("userType", "User");
        if (data?.user) {
          toast.success("User Login successful");

          // Handle user-specific logic
          // Redirect to Profile page
          router.push("ProfileUser");
        } else if (data?.ProjectManager) {
          toast.success("ProjectManager Login successful");

          // Handle admin-specific logic
          // Store user type in sessionStorage
          sessionStorage.setItem("userType", "ProjectManager");
          // Redirect to Profile page
          router.push("/projectManagerData/ProfileProjectManager");
        } else {
          toast.error("Unknown response structure");
          alert("Unknown response structure");
        }
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (error) {
      setError("An error occurred during login. Please try again.");
    }
  };

  return (
    <div>
      <NavbarUser />
      <div className="screenMiddleDiv">
        <div className="formDiv">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-center">Login as User</h2>

            {error && (
              <p className="text-red-500 text-xs text-center">{error}</p>
            )}

            <div>
              <label htmlFor="email" className="formLabel">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="my-6">
              <label htmlFor="password" className="formLabel">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="formButton">
              Login
            </button>

            <div className="text-center mt-4">
              <a href="#" className="text-sm hover:underline">
                Forgot your password?
              </a>
            </div>
            <div className="text-center mt-4">
              <Link
                href="/userData/LoginUser"
                className="buttonTiny text-white"
              >
                Login as User
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

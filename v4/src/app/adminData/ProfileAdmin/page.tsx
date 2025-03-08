"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import NavbarAdmin from "../NavbarAdmin/page";
import toast from "react-hot-toast/headless";

export default function ProfileAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profilePic: "/default-profile.png",
    contact: "",
    userType: "",
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch("../../api/auth/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userType: "Admin" }), // Fetch Admin data
        });

        const data = await response.json();

        if (data.success) {
          setIsAuthenticated(true);
          setAdmin({
            firstName: data.admin.firstname,
            lastName: data.admin.lastname,
            email: data.admin.email,
            profilePic: data.admin.profilepic
              ? `${data.admin.profilepic}?t=${new Date().getTime()}`
              : "/default-profile.png",
            contact: data.admin.contact || "",
            userType: data.admin.userType,
          });
        } else {
          setIsAuthenticated(false);
          setErrorMessage(data.message || "Invalid token");
          toast.error(data.message || "Invalid token");
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
        setErrorMessage("Failed to fetch admin data. Please try again later.");
        toast.error("Failed to fetch admin data. Please try again later.");
      }
      setLoading(false);
    };

    fetchAdminData();
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/adminData/LoginAdmin");
      toast.error("Failed to fetch admin data. Please try again later."); // Redirect Admins to AdminLogin
    }
  }, [isAuthenticated, loading, router]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("profilePic", selectedFile);
    formData.append("email", admin.email);

    try {
      const response = await fetch(
        "../../api/upload/admin-update-profile-pic",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (data.success) {
        // Force browser to fetch new image by appending timestamp
        const updatedProfilePic = `${
          data.profilePicUrl
        }?t=${new Date().getTime()}`;

        setAdmin((prevAdmin) => ({
          ...prevAdmin,
          profilePic: updatedProfilePic,
        }));
        toast.success("Picture Uploaded sucessfully");
      } else {
        console.error("Upload failed:", data.message);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (errorMessage) {
    return (
      <div>
        <h2>Error: {errorMessage}</h2>
        <p>Please log in again.</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div>
        <h2>No admin credentials found</h2>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div>
      <NavbarAdmin />
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold">Admin Profile</h1>
        <div className="mt-4 p-4 border rounded-lg shadow-md w-80 text-center">
          <Image
            src={admin.profilePic}
            alt="Profile Picture"
            width={100}
            height={100}
            className="rounded-full mx-auto"
          />
          <h2 className="mt-4 text-lg font-semibold">{admin.userType}</h2>
          <h2 className="mt-4 text-lg font-semibold">
            {admin.firstName} {admin.lastName}
          </h2>
          <p className="text-gray-600">{admin.email}</p>
          {admin.contact && (
            <p className="text-gray-500">Contact: {admin.contact}</p>
          )}
          <input type="file" onChange={handleFileChange} className="mt-4" />
          <button
            onClick={handleUpload}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Change Profile Picture
          </button>

          {/* Show All Users Button */}
          <button
            onClick={() => router.push("AllUsers")}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
          >
            Show All Users
          </button>
          {/* Show All ProjectManagers Button */}
          <button
            onClick={() => router.push("AllProjectManagers")}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
          >
            Show All ProjectManagers
          </button>
        </div>
      </div>
    </div>
  );
}

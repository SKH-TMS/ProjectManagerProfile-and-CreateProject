"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import NavbarUser from "../../userData/NavbarUser/page";

export default function Profile() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profilePic: "/default-profile.png",
    contact: "",
    userType: "",
    userRole: "",
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("../../api/auth/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userType: "User",
            userRole: "ProjectManager",
          }),
        });

        const data = await response.json();
        console.log("User data:", data);

        if (data.success) {
          setIsAuthenticated(true);
          setUser({
            firstName: data.user.firstname,
            lastName: data.user.lastname,
            email: data.user.email,
            profilePic: data.user.profilepic
              ? `${data.user.profilepic}?t=${new Date().getTime()}`
              : "/default-profile.png",
            contact: data.user.contact || "",
            userType: data.user.userType,
            userRole: data.user.userRole,
          });
        } else {
          setIsAuthenticated(false);
          setErrorMessage(data.message || "Invalid token");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setErrorMessage("Failed to fetch user data. Please try again later.");
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/userData/LoginUser");
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
    formData.append("email", user.email);

    try {
      const response = await fetch("../../api/upload/update-profile-pic", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        // Force browser to fetch new image by appending timestamp
        const updatedProfilePic = `${
          data.profilePicUrl
        }?t=${new Date().getTime()}`;

        setUser((prevUser) => ({
          ...prevUser,
          profilePic: updatedProfilePic,
        }));
      } else {
        console.error("Upload failed:", data.message);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  const handleCreateProject = async () => {
    if (!projectTitle || !projectDescription) {
      alert("Please fill in both fields.");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("../../api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: projectTitle,
          description: projectDescription,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Project created successfully!");
        setProjectTitle("");
        setProjectDescription("");
      } else {
        alert("Failed to create project: " + data.message);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert("An error occurred while creating the project.");
    }
    setIsCreating(false);
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
        <h2>No user credentials found</h2>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div>
      <NavbarUser />
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold">Profile</h1>
        <div className="mt-4 p-4 border rounded-lg shadow-md w-80 text-center">
          <Image
            src={user.profilePic}
            alt="Profile Picture"
            width={100}
            height={100}
            className="rounded-full mx-auto"
          />
          <h2 className="mt-4 text-lg font-semibold">{user.userRole}</h2>
          <h2 className="mt-4 text-lg font-semibold">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-gray-600">{user.email}</p>
          {user.contact && (
            <p className="text-gray-500">Contact: {user.contact}</p>
          )}
          <input type="file" onChange={handleFileChange} className="mt-4" />
          <button
            onClick={handleUpload}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Change Profile Picture
          </button>
          <button
            onClick={() => router.push("/projectManagerData/CreateProject")}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded"
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}

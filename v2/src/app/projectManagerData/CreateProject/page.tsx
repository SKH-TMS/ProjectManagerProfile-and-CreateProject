"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NavbarUser from "../../userData/NavbarUser/page";

export default function CreateProject() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(""); // ✅ Added deadline field
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!title || !description || !deadline) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    // Validate deadline (Ensure it's a future date)
    const today = new Date();
    const selectedDate = new Date(deadline);

    if (selectedDate <= today) {
      setError("Please select a future deadline.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "../../api/projectManagerData/createProject",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description, deadline }),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert("Project created successfully!");
        router.push("/projectManagerData/ProfileProjectManager"); // Navigate back to profile
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      setError("Failed to create project. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div>
      <NavbarUser />
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg">
          <h1 className="text-2xl font-bold text-center mb-6">
            Create New Project
          </h1>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Project Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400"
            />
            <textarea
              placeholder="Project Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400"
              rows={4}
            />

            {/* ✅ Deadline Input */}
            <label className="text-gray-700 font-semibold">
              Project Deadline:
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400"
            />

            <button
              type="submit"
              className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
          </form>

          <button
            onClick={() =>
              router.push("/projectManagerData/ProfileProjectManager")
            }
            className="mt-4 w-full p-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-md transition duration-200"
          >
            Cancel & Back to Profile
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NavbarAdmin from "../NavbarAdmin/page";
import toast from "react-hot-toast";

interface User {
  email: string;
  firstname: string;
  lastname: string;
  contact: string;
}

export default function UpdateUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const emails = searchParams.get("emails")?.split(",") || [];

  const hasFetched = useRef(false); // ✅ Prevent multiple API calls

  useEffect(() => {
    const fetchUsers = async () => {
      if (emails.length === 0 || hasFetched.current) return; // ✅ Prevents unnecessary calls

      try {
        console.log("📡 Fetching Users:", emails);
        const response = await fetch("../../api/adminData/getUsersByEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emails }),
        });

        const data = await response.json();

        if (data.success) {
          setUsers(data.users);
          console.log("✅ Users Fetched:", data.users);
        } else {
          setError(data.message || "Failed to fetch users.");
          console.error("❌ Fetch Users Error:", data.message);
        }
      } catch (error) {
        console.error("❌ Error fetching users:", error);
        setError("Failed to fetch users.");
      }

      setLoading(false);
      hasFetched.current = true; // ✅ Prevents duplicate API calls
    };

    fetchUsers();
  }, [emails]);

  const handleInputChange = (
    index: number,
    field: keyof User,
    value: string
  ) => {
    setUsers((prevUsers) =>
      prevUsers.map((user, i) =>
        i === index ? { ...user, [field]: value } : user
      )
    );
  };

  const handleUpdate = async () => {
    if (users.length === 0) {
      alert("No Project Managers to update.");
      return;
    }

    try {
      const response = await fetch("../../api/adminData/updateUsers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(" Project Managers updated successfully!");
        router.push("AllProjectManagers");
      } else {
        toast.error("❌ Failed to update users: " + data.message);
        console.error("❌ Update Users Error:", data.message);
      }
    } catch (error) {
      console.error("❌ Error updating users:", error);
      toast.error("❌ Failed to update users. Please try again.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <NavbarAdmin />
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Update Project Managers</h1>

        {users.length === 0 ? (
          <p className="text-gray-500">
            No Project Managers selected for update.
          </p>
        ) : (
          users.map((user, index) => (
            <div key={user.email} className="mb-4 p-4 border rounded">
              <h2 className="text-lg font-semibold">{user.email}</h2>

              <input
                type="text"
                value={user.firstname}
                onChange={(e) =>
                  handleInputChange(index, "firstname", e.target.value)
                }
                className="border p-2 w-full mt-2"
                placeholder="First Name"
              />

              <input
                type="text"
                value={user.lastname}
                onChange={(e) =>
                  handleInputChange(index, "lastname", e.target.value)
                }
                className="border p-2 w-full mt-2"
                placeholder="Last Name"
              />

              <input
                type="text"
                value={user.contact}
                onChange={(e) =>
                  handleInputChange(index, "contact", e.target.value)
                }
                className="border p-2 w-full mt-2"
                placeholder="Contact Number"
              />
            </div>
          ))
        )}

        <button
          onClick={handleUpdate}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Update Project Managers
        </button>
      </div>
    </div>
  );
}

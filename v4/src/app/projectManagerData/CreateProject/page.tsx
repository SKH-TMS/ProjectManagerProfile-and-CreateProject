"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavbarUser from "../../userData/NavbarUser/page";
import { ITeam } from "@/models/Team"; // ✅ Import ITeam interface
import toast from "react-hot-toast";

export default function CreateProject() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [selectedHour, setSelectedHour] = useState("12");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedAmPm, setSelectedAmPm] = useState("AM");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [teams, setTeams] = useState<ITeam[]>([]);

  const [selectedTeam, setSelectedTeam] = useState<ITeam | null>(null);

  // Fetch available teams for optional assignment
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch("../../api/projectManagerData/getTeams");
        const data = await response.json();

        if (data.success) {
          setTeams(data.teams);
        } else {
          console.error("Error fetching teams:", data.message);
          router.push("/userData/LoginUser");
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
        toast.error("Error fetching teams:");
      }
    };

    fetchTeams();
  }, []);

  // Convert selected time into 24-hour format
  const getFormattedTime = () => {
    let hour = parseInt(selectedHour);
    const minute = selectedMinute;
    if (selectedAmPm === "PM" && hour !== 12) {
      hour += 12;
    }
    if (selectedAmPm === "AM" && hour === 12) {
      hour = 0;
    }
    return `${hour.toString().padStart(2, "0")}:${minute}:00`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!title || !description) {
      setError("Please fill in all fields.");
      toast.error("Please fill in all fields.");
      setLoading(false);
      return;
    }

    // If a team is selected, ensure the deadline is provided
    if (
      selectedTeam &&
      (!deadlineDate || !selectedHour || !selectedMinute || !selectedAmPm)
    ) {
      setError("Please fill in the deadline details when assigning to a team.");
      toast.error(
        "Please fill in the deadline details when a assigning to a team"
      );
      setLoading(false);
      return;
    }

    let combinedDeadline = null;

    // If the team is selected, then combine the date and time for the deadline
    if (selectedTeam) {
      const finalTime = getFormattedTime();
      combinedDeadline = new Date(`${deadlineDate}T${finalTime}`);

      if (isNaN(combinedDeadline.getTime())) {
        setError("Invalid date/time selection.");
        toast.error("Invalid date/time selection.");
        setLoading(false);
        return;
      }

      // Ensure deadline is in the future
      const now = new Date();
      if (combinedDeadline <= now) {
        setError("Please select a future deadline.");
        toast.error("Please select a future deadline.");
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(
        "../../api/projectManagerData/createProject",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            deadline: combinedDeadline ? combinedDeadline.toISOString() : null, // If no deadline, send null
            assignedTeam: selectedTeam,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        if (selectedTeam) {
          toast.success("Project created successfully and team is assigned");
        } else {
          toast.success(
            "Project created successfully without assigning a team!"
          );
        }
        router.push(`/projectManagerData/ProfileProjectManager`);
      } else {
        setError(data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      setError("Failed to create project. Please try again.");
      toast.error("Failed to create project. Please try again.");
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
            {/* ✅ Project Title */}
            <input
              type="text"
              placeholder="Project Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400"
            />

            {/* ✅ Project Description */}
            <textarea
              placeholder="Project Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400"
              rows={4}
            />

            {/* ✅ Optional Team Assignment */}
            <label className="text-gray-700 font-semibold">
              Assign to a Team (Optional):
            </label>
            <select
              value={selectedTeam?.teamId || ""}
              onChange={(e) => {
                const team = teams.find((t) => t.teamId === e.target.value);
                setSelectedTeam(team || null);
              }}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 text-blue-500"
            >
              <option value="">-- Select a Team (Optional) --</option>
              {teams.map((team) => (
                <option key={team.teamId} value={team.teamId}>
                  {team.teamName}
                </option>
              ))}
            </select>

            {/* ✅ Render Deadline Input Fields Only If Team is Selected */}
            {selectedTeam && (
              <>
                {/* Deadline Date Input */}
                <label className="text-gray-700 font-semibold">
                  Project Deadline Date:
                </label>
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400"
                />

                {/* Deadline Time Selection */}
                <label className="text-gray-700 font-semibold">
                  Project Deadline Time:
                </label>
                <div className="flex space-x-2 text-teal-800">
                  {/* Hours Dropdown */}
                  <select
                    value={selectedHour}
                    onChange={(e) => setSelectedHour(e.target.value)}
                    className="w-1/3 p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                      <option key={h} value={h.toString().padStart(2, "0")}>
                        {h}
                      </option>
                    ))}
                  </select>

                  {/* Minutes Dropdown */}
                  <select
                    value={selectedMinute}
                    onChange={(e) => setSelectedMinute(e.target.value)}
                    className="w-1/3 p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {["00", "15", "30", "45"].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>

                  {/* AM/PM Dropdown */}
                  <select
                    value={selectedAmPm}
                    onChange={(e) => setSelectedAmPm(e.target.value)}
                    className="w-1/3 p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </>
            )}

            {/* ✅ Submit Button */}
            <button
              type="submit"
              className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
          </form>

          {/* ✅ Cancel Button */}
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

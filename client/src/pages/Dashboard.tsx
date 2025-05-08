import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { v4 as uuidv4 } from "uuid";

const Dashboard = () => {
  // State to store user input for joining a meeting
  const [codeInput, setCodeInput] = useState("");

  // State to store error messages if any
  const [error, setError] = useState("");

  // State to track if a meeting is currently being created
  const [creating, setCreating] = useState(false);

  // React Router navigation hook
  const navigate = useNavigate();

  // Function to handle joining an existing meeting by code
  const handleJoin = async () => {
    const code = codeInput.trim(); // Clean the input
    if (!code) return;

    // Query the "rooms" table for a room with the given code
    const { data, error } = await supabase
      .from("rooms")
      .select("id")
      .eq("code", code)
      .single();

    // If room is not found, show error. Otherwise, navigate to the room
    if (error || !data) {
      setError("Meeting not found.");
    } else {
      navigate(`/meeting/${code}`);
    }
  };

  // Function to handle creating a new meeting
  const handleCreate = async () => {
    setCreating(true);
    setError("");

    // Get the currently authenticated user
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    // If no user is found, show error
    if (!user) {
      setError("User not authenticated");
      setCreating(false);
      return;
    }

    // Generate a short random code for the meeting
    const meetingCode = uuidv4().slice(0, 6);

    // Insert a new room into the "rooms" table
    const { error: insertError } = await supabase.from("rooms").insert({
      code: meetingCode,
      created_by: user.id,
    });

    setCreating(false);

    // If insertion failed, show error. Otherwise, navigate to the new room
    if (insertError) {
      setError("Failed to create meeting.");
    } else {
      navigate(`/meeting/${meetingCode}`);
    }
  };

  return (
    // Outer container centered both vertically and horizontally
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      {/* Page heading */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-800 mb-6">
        Start or join a meeting instantly
      </h1>

      {/* Input field and join button */}
      <div className="w-full max-w-md flex flex-col gap-3">
        <input
          type="text"
          placeholder="Enter meeting code"
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-lg shadow-sm"
        />
        <button
          onClick={handleJoin}
          className="bg-gray-800 text-white py-2 rounded-md hover:bg-gray-700 transition"
        >
          Join
        </button>
      </div>

      {/* Divider between join and create options */}
      <div className="mt-8 text-base font-medium text-gray-600">OR</div>

      {/* Create meeting button */}
      <button
        onClick={handleCreate}
        disabled={creating}
        className="mt-4 px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition disabled:opacity-50"
      >
        {creating ? "Creating..." : "Create Meeting"}
      </button>

      {/* Error message if any */}
      {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
    </div>
  );
};

export default Dashboard;

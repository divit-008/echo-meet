import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { v4 as uuidv4 } from "uuid";

const Dashboard = () => {
  const [codeInput, setCodeInput] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async () => {
    const code = codeInput.trim();
    if (!code) return;

    const { data, error } = await supabase
      .from("rooms")
      .select("id")
      .eq("code", code)
      .single();

    if (error || !data) {
      setError("Meeting not found.");
    } else {
      navigate(`/meeting/${code}`);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    setError("");

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      setError("User not authenticated");
      setCreating(false);
      return;
    }

    const meetingCode = uuidv4().slice(0, 6);

    const { error: insertError } = await supabase.from("rooms").insert({
      code: meetingCode,
      created_by: user.id,
    });

    setCreating(false);

    if (insertError) {
      setError("Failed to create meeting.");
    } else {
      navigate(`/meeting/${meetingCode}`);
    }
  };

  return (
    <div >
      <h1 >Welcome to Echo Meet</h1>

      <div >
        <input
          type="text"
          placeholder="Enter meeting code"
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value)}
        />
        <button
          onClick={handleJoin}
        >
          Join
        </button>
      </div>

      <div>or</div>

      <button
        onClick={handleCreate}
        disabled={creating}
      >
        {creating ? "Creating..." : "Create Meeting"}
      </button>

      {error && <p >{error}</p>}
    </div>
  );
};

export default Dashboard;

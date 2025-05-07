import { supabase } from "../supabaseClient";
// import { useNavigate } from "react-router-dom";

const Homepage = () => {
  // const navigate = useNavigate();

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:5173/dashboard", 
      },
    });

    if (error) console.error("Error logging in:", error.message);
  };

  return (
    <div>
      <h1>
        A lightweight, real-time video meeting app with user accounts, room hosting/joining via code or link, and a responsive UI.
      </h1>
      <button
        onClick={handleSignIn}
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default Homepage;

import { supabase } from "../supabaseClient";

const Homepage = () => {
  // Function to handle Google sign-in using Supabase OAuth
  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google", // Specify Google as the OAuth provider
      options: {
        redirectTo: `${window.location.origin}/dashboard`, // Redirect after successful sign-in
      },
    });

    // Log any sign-in error to the console
    if (error) console.error("Error logging in:", error.message);
  };

  return (
    // Page container centered with padding and light background
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      {/* Headline describing the product */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium text-gray-800 max-w-2xl leading-snug">
        Simple meetings.
        <br />
        Clear connections.
      </h1>

      {/* Supporting text about the app */}
      <p className="mt-4 text-lg text-gray-600 max-w-xl">
        Create or join meetings with a code or link — fast, clean, and
        distraction-free.
      </p>

      {/* Button to trigger sign-in flow */}
      <button
        onClick={handleSignIn}
        className="mt-8 px-6 py-3 bg-gray-800 text-white text-base rounded-md hover:bg-gray-700 transition"
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default Homepage;

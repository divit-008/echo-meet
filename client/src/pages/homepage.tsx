import { supabase } from "../supabaseClient"
import { useNavigate } from "react-router-dom"
const homepage = () => {
    const navigate = useNavigate()
    const handleSignIn = async () =>{
        const {error} = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: 'http://localhost:5173/dashboard',
          }
        })
        if (error) console.error("Error Logging in :", error.message)
    }
  return (
    <div>
      <h1>A lightweight, real-time video meeting app with user accounts, room hosting/joining via code or link, and a responsive UI.</h1>
      <button onClick={handleSignIn}>Sign In with google</button>
    </div>
  )
}

export default homepage
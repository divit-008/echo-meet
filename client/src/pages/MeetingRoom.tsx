import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const MeetingRoom = () => {
    const { code } = useParams<{code: string}>()
    const [roomExists, setRoomExists] = useState<boolean | null>(null)

    useEffect(()=>{
        const tries = 0
        const checkRoom = async () => {
            const {data, error } = await supabase
            .from("rooms")
            .select("id")
            .eq("code", code)
            .single();
            if (data &&  !error) {
                setRoomExists(true);
            }else if (tries< 3) {
                setTimeout(checkRoom, 300);
            } else {
                setRoomExists(false);
            }
        };

        checkRoom();
    }, [code]);

    if (roomExists === null) {
        return <div>Loading...</div>
    }

    if (!roomExists) {
        return <div>Meeting not found.</div>;
    }
  return (
    <div>
        <h1>Meeting Room</h1>
        <p>Meeting code : {code}</p>
        {/* {} */}
    </div>
  );
};

export default MeetingRoom
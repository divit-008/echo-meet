import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

// Type definition for each participant in the room
interface Participant {
  user_id: string;
  display_name: string;
  avatar_url: string;
  is_muted: boolean;
  video_on: boolean;
  is_host: boolean;
}

const MeetingRoom = () => {
  // Get the meeting code from the URL (e.g., /meeting/:code)
  const { code } = useParams<{ code: string }>();

  // Tracks if the meeting room exists in the database
  const [roomExists, setRoomExists] = useState<boolean | null>(null);

  // Stores the list of all participants currently in the room
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Stores the current user's ID
  const [userId, setUserId] = useState<string | null>(null);

  // Tracks whether the current user has muted themselves
  const [isMuted, setIsMuted] = useState(false);

  // Tracks whether the current user's video is on
  const [videoOn, setVideoOn] = useState(true);

  useEffect(() => {
    // Store unsubscribe cleanup function for Realtime subscription
    let cleanup: (() => void) | null = null;

    // Called when user joins the room
    const joinRoom = async () => {
      // Get current session and user
      const sessionRes = await supabase.auth.getSession();
      const user = sessionRes.data.session?.user;

      // If user not signed in, don't proceed
      if (!user) {
        setRoomExists(false);
        return;
      }

      // Store user ID locally
      setUserId(user.id);

      // Check if the meeting room with the given code exists
      const { data: room, error } = await supabase
        .from('rooms')
        .select('created_by')
        .eq('code', code)
        .single();

      // If room doesn't exist or error occurs, set state and exit
      if (!room || error) {
        setRoomExists(false);
        return;
      }

      // Room is valid
      setRoomExists(true);

      // Get user metadata from their Google account
      const meta = user.user_metadata;

      // Insert or update the current user into the room_participants table
      await supabase.from('room_participants').upsert({
        room_code: code,
        user_id: user.id,
        display_name: meta?.full_name || 'Guest',
        avatar_url: meta?.picture || '',
        is_host: user.id === room.created_by,
      });

      // Fetch initial list of participants
      await fetchParticipants();

      // Subscribe to participant changes (realtime)
      cleanup = subscribeToParticipants();
    };

    // Call the function to join room
    joinRoom();

    // Cleanup when user leaves the page or reloads
    return () => {
      // Remove current user from the room_participants table
      if (userId) {
        supabase
          .from('room_participants')
          .delete()
          .eq('room_code', code)
          .eq('user_id', userId);
      }

      // Unsubscribe from Realtime updates
      if (cleanup) cleanup();
    };
  }, [code, userId]);

  // Fetch all current participants in the room from Supabase
  const fetchParticipants = async () => {
    const { data } = await supabase
      .from('room_participants')
      .select('*')
      .eq('room_code', code);

    // Store the full participant list in state
    setParticipants(data || []);

    // Also find the current user and sync their mute/video state
    const self = data?.find((p) => p.user_id === userId);
    if (self) {
      setIsMuted(self.is_muted);
      setVideoOn(self.video_on);
    }
  };

  // Subscribes to any insert/update/delete events on room_participants
  const subscribeToParticipants = () => {
    const channel = supabase
      .channel('room_participants')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_participants' },
        fetchParticipants
      )
      .subscribe();

    // Return cleanup function to remove the subscription
    return () => {
      supabase.removeChannel(channel);
    };
  };

  // Show loading screen while checking if room exists
  if (roomExists === null) {
    return (
      <div className="h-screen flex items-center justify-center text-lg">
        Checking room...
      </div>
    );
  }

  // Show error screen if room is invalid
  if (!roomExists) {
    return (
      <div className="h-screen flex items-center justify-center text-red-600 text-xl font-bold">
        Meeting not found.
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top header with meeting name and copy link button */}
      <div className="flex justify-between items-center p-4 bg-white shadow-md">
        <h1 className="text-lg font-bold">EchoMeet</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm">Code: {code}</span>
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="bg-gray-200 text-sm px-3 py-1 rounded hover:bg-gray-300"
          >
            📋 Copy Link
          </button>
        </div>
      </div>

      {/* Main participant grid layout */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-black">
        {participants.map((p) => (
          <div
            key={p.user_id}
            className="relative bg-gray-800 aspect-video rounded overflow-hidden"
          >
            {/* Show avatar if video is off */}
            {!p.video_on ? (
              <img
                src={p.avatar_url}
                alt={`${p.display_name}'s avatar`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-white flex items-center justify-center h-full">
                [Live Video Placeholder]
              </div>
            )}

            {/* Display name + host badge */}
            <div className="absolute bottom-2 left-2 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded">
              {p.is_host && '👑 '}
              {p.display_name}
            </div>

            {/* Mute icon overlay */}
            {p.is_muted && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                🔇
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Controls for current user */}
      <div className="flex justify-center gap-4 p-4 bg-white border-t">
        {/* Mute toggle */}
        <button
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          onClick={async () => {
            const newMuteState = !isMuted;
            setIsMuted(newMuteState);
            await supabase
              .from("room_participants")
              .update({ is_muted: newMuteState })
              .eq("room_code", code)
              .eq("user_id", userId);
          }}
        >
          {isMuted ? "🔈 Unmute" : "🎙 Mute"}
        </button>

        {/* Video toggle */}
        <button
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          onClick={async () => {
            const newVideoState = !videoOn;
            setVideoOn(newVideoState);
            await supabase
              .from("room_participants")
              .update({ video_on: newVideoState })
              .eq("room_code", code)
              .eq("user_id", userId);
          }}
        >
          {videoOn ? "🎥 Stop Video" : "📷 Start Video"}
        </button>

        {/* Leave meeting */}
        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={async () => {
            await supabase
              .from("room_participants")
              .delete()
              .eq("room_code", code)
              .eq("user_id", userId);
            window.location.href = "/";
          }}
        >
          🚪 Leave
        </button>
      </div>
    </div>
  );
};

export default MeetingRoom;

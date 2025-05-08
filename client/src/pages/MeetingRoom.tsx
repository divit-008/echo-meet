// FINAL VERSION WITH STYLED HEADER AND FOOTER
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";
import Peer from "peerjs";
import type PeerJS from "peerjs";
import type { RealtimeChannel } from "@supabase/supabase-js";

// Interface defining the structure of a participant
interface Participant {
  user_id: string;
  display_name: string;
  avatar_url: string;
  is_muted: boolean;
  video_on: boolean;
  is_host: boolean;
  peer_id?: string;
}

const MeetingRoom = () => {
  const { code } = useParams<{ code: string }>(); // Extract meeting code from URL
  const [roomExists, setRoomExists] = useState<boolean | null>(null); // Track if the room exists
  const [participants, setParticipants] = useState<Participant[]>([]); // All participants in the room
  const [userId, setUserId] = useState<string | null>(null); // Current user ID
  const [isMuted, setIsMuted] = useState(false); // Whether local user is muted
  const [videoOn, setVideoOn] = useState(true); // Whether local video is on

  // Refs for local and remote media
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const myPeerRef = useRef<Peer | null>(null);
  const peersRef = useRef<{ [peerId: string]: PeerJS.MediaConnection }>({});
  const remoteStreams = useRef<{ [userId: string]: MediaStream }>({});
  const videoRefs = useRef<{ [userId: string]: HTMLVideoElement | null }>({});
  const audioRefs = useRef<{ [userId: string]: HTMLAudioElement | null }>({});

  // Fetch all participants from Supabase
  const fetchParticipants = async () => {
    const { data } = await supabase
      .from("room_participants")
      .select("*")
      .eq("room_code", code);
    if (data) setParticipants(data as Participant[]);
  };

  // Build a fresh stream from current local tracks
  const getFreshStream = (): MediaStream => {
    const stream = new MediaStream();
    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track) => stream.addTrack(track));
    }
    return stream;
  };

  // Reconnect all peer connections using updated streams
  const reconnectPeers = () => {
    Object.values(peersRef.current).forEach((call) => call.close());
    peersRef.current = {};

    participants.forEach((p) => {
      if (p.user_id !== userId && p.peer_id && myPeerRef.current) {
        const freshStream = getFreshStream();
        const call = myPeerRef.current.call(p.peer_id, freshStream);

        call.on("stream", (stream: MediaStream) => {
          remoteStreams.current[p.user_id] = stream;

          const videoEl = videoRefs.current[p.user_id];
          const audioEl = audioRefs.current[p.user_id];
          if (videoEl) {
            videoEl.srcObject = stream;
            videoEl.play().catch(() => {});
          }
          if (audioEl && !p.is_muted) {
            audioEl.srcObject = stream;
            audioEl.play().catch(() => {});
          }
        });

        call.on("close", () => {
          delete remoteStreams.current[p.user_id];
        });

        peersRef.current[p.peer_id] = call;
      }
    });
  };

  // Main effect: handles room joining and peer setup
  useEffect(() => {
    let channel: RealtimeChannel;

    const joinRoom = async () => {
      const session = await supabase.auth.getSession();
      const user = session.data.session?.user;
      if (!user) return setRoomExists(false);

      setUserId(user.id);

      const { data: room, error } = await supabase
        .from("rooms")
        .select("created_by")
        .eq("code", code)
        .single();

      if (!room || error) return setRoomExists(false);
      setRoomExists(true);

      const meta = user.user_metadata;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        localVideoRef.current.play();
      }

      const peer = new Peer(user.id, {
        host: "0.peerjs.com",
        port: 443,
        secure: true,
      });

      myPeerRef.current = peer;

      peer.on("open", async (peerId: string) => {
        await supabase.from("room_participants").upsert({
          room_code: code,
          user_id: user.id,
          display_name: meta?.full_name || "Guest",
          avatar_url: meta?.picture || "",
          is_host: user.id === room.created_by,
          is_muted: false,
          video_on: true,
          peer_id: peerId,
        });

        await fetchParticipants();
        reconnectPeers();
      });

      peer.on("call", (call: PeerJS.MediaConnection) => {
        const freshStream = getFreshStream();
        call.answer(freshStream);

        call.on("stream", (remoteStream: MediaStream) => {
          const matching = participants.find((p) => p.peer_id === call.peer);
          if (!matching) return;

          remoteStreams.current[matching.user_id] = remoteStream;

          const videoEl = videoRefs.current[matching.user_id];
          const audioEl = audioRefs.current[matching.user_id];

          if (videoEl) {
            videoEl.srcObject = remoteStream;
            videoEl.play().catch(() => {});
          }

          if (audioEl && !matching.is_muted) {
            audioEl.srcObject = remoteStream;
            audioEl.play().catch(() => {});
          }
        });

        call.on("close", () => {
          const matching = participants.find((p) => p.peer_id === call.peer);
          if (matching) delete remoteStreams.current[matching.user_id];
        });

        peersRef.current[call.peer] = call;
      });

      // Set up real-time Supabase channel for participant changes
      channel = supabase
        .channel("room_participants_changes")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "room_participants" },
          fetchParticipants
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "room_participants" },
          fetchParticipants
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "room_participants" },
          fetchParticipants
        )
        .subscribe();
    };

    joinRoom();

    return () => {
      // Cleanup: remove user from room and unsubscribe
      if (userId) {
        supabase
          .from("room_participants")
          .delete()
          .eq("room_code", code)
          .eq("user_id", userId);
      }
      if (channel) supabase.removeChannel(channel);
    };
  }, [code]);

  // Reconnect peers and ensure local video updates on changes
  useEffect(() => {
    reconnectPeers();
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
      localVideoRef.current.play().catch(() => {});
    }
  }, [participants, videoOn]);

  // Render fallback if room doesn't exist
  if (roomExists === false) {
    return (
      <div className="h-screen flex items-center justify-center text-red-600">
        Meeting not found.
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 font-sans">
      {/* Header with app title and room code */}
      <div className="flex justify-between items-center px-6 py-4 bg-gray-100 text-black">
        <h1 className="text-2xl font-bold tracking-wide">Echo Meet</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm opacity-90">Code: {code}</span>
          <button
            onClick={() =>
              navigator.clipboard.writeText(
                `${window.location.origin}/room/${code}`
              )
            }
            className="text-sm px-3 py-1 rounded bg-white text-indigo-600 font-medium hover:bg-gray-100 transition"
          >
            Copy Link
          </button>
        </div>
      </div>

      {/* Remote participant audio elements */}
      {participants
        .filter((p) => p.user_id !== userId)
        .map((p) => (
          <audio
            key={`audio-${p.user_id}`}
            ref={(el) => {
              if (el) audioRefs.current[p.user_id] = el;
            }}
            autoPlay
          />
        ))}

      {/* Video grid for local and remote participants */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {/* Local video display */}
        <div className="relative aspect-video bg-black rounded overflow-hidden">
          {videoOn ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-sm">
              Camera Off
            </div>
          )}
          <div className="absolute bottom-1 left-1 text-xs bg-black bg-opacity-60 text-white px-2 py-1 rounded">
            You {isMuted ? "(Muted)" : ""}
          </div>
        </div>

        {/* Remote video displays */}
        {participants
          .filter((p) => p.user_id !== userId)
          .map((p) => (
            <div
              key={p.user_id}
              className="relative aspect-video bg-black rounded overflow-hidden"
            >
              {p.video_on ? (
                <video
                  ref={(el) => {
                    if (el) videoRefs.current[p.user_id] = el;
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={p.avatar_url || "/fallback-avatar.png"}
                  alt={p.display_name}
                  className="w-full h-full object-cover opacity-70"
                />
              )}
              <div className="absolute bottom-1 left-1 text-xs bg-black bg-opacity-60 text-white px-2 py-1 rounded">
                {p.is_host ? "Host: " : ""}
                {p.display_name} {p.is_muted ? "(Muted)" : ""}
              </div>
              {!p.video_on && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                    Camera Off
                  </span>
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Footer with control buttons */}
      <div className="flex justify-center gap-4 p-4 bg-gray-100">
        <button
          onClick={async () => {
            const newMuted = !isMuted;
            setIsMuted(newMuted);
            const audioTrack = localStreamRef.current?.getAudioTracks()[0];
            if (audioTrack) audioTrack.enabled = !newMuted;
            await supabase
              .from("room_participants")
              .update({ is_muted: newMuted })
              .eq("room_code", code)
              .eq("user_id", userId);
            await fetchParticipants();
          }}
          className="px-4 py-2 bg-white text-black font-medium rounded hover:bg-gray-100 transition"
        >
          {isMuted ? "Unmute" : "Mute"}
        </button>

        <button
          onClick={async () => {
            const newVideo = !videoOn;
            setVideoOn(newVideo);
            const videoTrack = localStreamRef.current?.getVideoTracks()[0];
            if (videoTrack) videoTrack.enabled = newVideo;
            await supabase
              .from("room_participants")
              .update({ video_on: newVideo })
              .eq("room_code", code)
              .eq("user_id", userId);
            await fetchParticipants();
          }}
          className="px-4 py-2 bg-white text-black font-medium rounded hover:bg-gray-100 transition"
        >
          {videoOn ? "Stop Video" : "Start Video"}
        </button>

        <button
          onClick={async () => {
            await supabase
              .from("room_participants")
              .delete()
              .eq("room_code", code)
              .eq("user_id", userId);
            window.location.href = "/";
          }}
          className="px-4 py-2 bg-red-500 text-white font-medium rounded hover:bg-red-600 transition"
        >
          Leave
        </button>
      </div>
    </div>
  );
};

export default MeetingRoom;

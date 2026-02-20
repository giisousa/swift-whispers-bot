import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { FlagType, TeamMessage } from "@/data/messages";

// Generate a notification sound using Web Audio API
const playUrgentSound = () => {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    // Urgent alarm: two-tone beep
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
    oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  } catch {
    // Audio not available
  }
};

const playNormalSound = () => {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(523, ctx.currentTime);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  } catch {
    // Audio not available
  }
};

const showBrowserNotification = (msg: { author: string; content: string; flag: string }) => {
  if (Notification.permission === "granted") {
    new Notification(`${msg.flag === "urgent" ? "🚨 URGENTE" : "📩"} ${msg.author}`, {
      body: msg.content,
      icon: "/favicon.ico",
      tag: "team-message",
    });
  }
};

export function useTeamMessages() {
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const initialLoadDone = useRef(false);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("team_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (data) {
        setMessages(
          data.map((d) => ({
            id: d.id,
            author: d.author,
            avatar: d.avatar,
            content: d.content,
            flag: d.flag as FlagType,
            timestamp: new Date(d.created_at),
            read: d.read ?? false,
          }))
        );
      }
      setLoading(false);
      initialLoadDone.current = true;
    };
    fetchMessages();
  }, []);

  // Subscribe to realtime
  useEffect(() => {
    const channel = supabase
      .channel("team_messages_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "team_messages" },
        (payload) => {
          if (!initialLoadDone.current) return;
          const d = payload.new as any;
          const newMsg: TeamMessage = {
            id: d.id,
            author: d.author,
            avatar: d.avatar,
            content: d.content,
            flag: d.flag as FlagType,
            timestamp: new Date(d.created_at),
            read: false,
          };

          setMessages((prev) => [newMsg, ...prev]);

          // Sound + push notification
          if (d.flag === "urgent" || d.flag === "high") {
            playUrgentSound();
          } else {
            playNormalSound();
          }
          showBrowserNotification(d);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sendMessage = useCallback(
    async (content: string, flag: FlagType) => {
      await supabase.from("team_messages").insert({
        author: "Você",
        avatar: "VC",
        content,
        flag,
      });
    },
    []
  );

  return { messages, loading, sendMessage };
}

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({ user: null, session: null, loading: true, signOut: async () => {} });

const BROADCAST_CHANNEL = "henwork-auth";

// Strip any legacy localStorage tokens left behind from older builds that
// shared sessions across tabs. This prevents a stale token from being reused.
function purgeLegacyAuth() {
  if (typeof window === "undefined") return;
  try {
    for (let i = window.localStorage.length - 1; i >= 0; i--) {
      const key = window.localStorage.key(i);
      if (!key) continue;
      if (key.startsWith("sb-") || key.startsWith("supabase.") || key.startsWith("henwork-auth-")) {
        window.localStorage.removeItem(key);
      }
    }
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    purgeLegacyAuth();

    // Listen FIRST so we never miss an event during init.
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setLoading(false);
      if (event === "SIGNED_OUT") {
        channelRef.current?.postMessage({ type: "SIGNED_OUT" });
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        channelRef.current?.postMessage({ type: "SIGNED_IN", userId: s?.user.id });
      }
    });

    // Validate the actual user (not just cached session) on mount.
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setSession(null);
        setLoading(false);
        return;
      }
      const { data: userData, error } = await supabase.auth.getUser();
      if (error || !userData.user) {
        await supabase.auth.signOut();
        setSession(null);
      } else {
        setSession(sessionData.session);
      }
      setLoading(false);
    })();

    // Cross-tab signout sync (each tab has its own session, but a global
    // signout should propagate so stale UIs don't linger).
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const ch = new BroadcastChannel(BROADCAST_CHANNEL);
      channelRef.current = ch;
      ch.onmessage = async (msg) => {
        if (msg.data?.type === "SIGNED_OUT") {
          await supabase.auth.signOut().catch(() => {});
          setSession(null);
        }
      };
    }

    return () => {
      sub.subscription.unsubscribe();
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, []);

  return (
    <Ctx.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        signOut: async () => {
          await supabase.auth.signOut();
          channelRef.current?.postMessage({ type: "SIGNED_OUT" });
          setSession(null);
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);

"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type CurrentMember = {
  id: string;
  name: string;
  role: string;
  color: string;
  initials: string;
};

type Ctx = {
  current: CurrentMember | null;
  members: CurrentMember[];
  loading: boolean;
  refresh: () => Promise<void>;
  setCurrent: (m: CurrentMember | null) => void;
};

const MemberCtx = createContext<Ctx>({
  current: null,
  members: [],
  loading: true,
  refresh: async () => {},
  setCurrent: () => {},
});

const LS_KEY = "tadabbur:currentMemberId";

export function MemberProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<CurrentMember[]>([]);
  const [current, setCurrentState] = useState<CurrentMember | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/members");
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      const list: CurrentMember[] = (data?.members || []).map((m: any) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        color: m.color,
        initials: m.initials || m.name?.slice(0, 2) || "؟",
      }));
      setMembers(list);

      // استعادة العضو الحالي من localStorage
      const savedId =
        typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
      if (savedId) {
        const found = list.find((m) => m.id === savedId) || null;
        setCurrentState(found);
      }
    } catch (e) {
      console.error("MemberProvider refresh", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setCurrent = useCallback((m: CurrentMember | null) => {
    setCurrentState(m);
    if (typeof window !== "undefined") {
      if (m) localStorage.setItem(LS_KEY, m.id);
      else localStorage.removeItem(LS_KEY);
    }
  }, []);

  return (
    <MemberCtx.Provider value={{ current, members, loading, refresh, setCurrent }}>
      {children}
    </MemberCtx.Provider>
  );
}

export function useMember() {
  return useContext(MemberCtx);
}

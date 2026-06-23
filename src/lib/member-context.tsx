"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

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
  isAdmin: boolean;
  refresh: () => Promise<void>;
};

const MemberCtx = createContext<Ctx>({
  current: null,
  members: [],
  loading: true,
  isAdmin: false,
  refresh: async () => {},
});

export function MemberProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [members, setMembers] = useState<CurrentMember[]>([]);
  const [loading, setLoading] = useState(true);

  const memberId = session?.user?.memberId;
  const isAdmin = session?.user?.accessLevel === "ADMIN" && session?.user?.status === "ACTIVE";

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/members");
      if (!res.ok) {
        setMembers([]);
        return;
      }
      const data = await res.json();
      const list: CurrentMember[] = (data?.members || []).map((m: { id: string; name: string; role: string; color: string; initials?: string }) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        color: m.color,
        initials: m.initials || m.name?.slice(0, 2) || "؟",
      }));
      setMembers(list);
    } catch (e) {
      console.error("MemberProvider refresh", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status !== "loading") refresh();
  }, [status, refresh]);

  const current: CurrentMember | null =
    members.find((m) => m.id === memberId) ??
    (memberId
      ? {
          id: memberId,
          name: session?.user?.name ?? "",
          role: "",
          color: "#c9a24b",
          initials: (session?.user?.name ?? "؟").slice(0, 2),
        }
      : null);

  return (
    <MemberCtx.Provider value={{ current, members, loading, isAdmin, refresh }}>
      {children}
    </MemberCtx.Provider>
  );
}

export function useMember() {
  return useContext(MemberCtx);
}

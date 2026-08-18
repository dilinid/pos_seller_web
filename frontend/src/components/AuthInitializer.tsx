import { useEffect } from "react";
import { fetchMergedUserProfile } from "../utils/profile.utils";
import { useAuthStore } from "../stores/auth.store";

export function AuthInitializer() {
  const userSession = useAuthStore((state) => state.userSession);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      if (!userSession) return;

      try {
        const user = await fetchMergedUserProfile(userSession.username);
        if (!cancelled) {
          setUser(user);
        }
      } catch {
        // session invalid
      }
    }

    initialize();
    return () => { cancelled = true; };
  }, [userSession]);

  return null;
}

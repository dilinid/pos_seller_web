import { useEffect } from "react";
import type { UserProfile } from "../types/profile.type";
import { fetchUserProfile } from "../apis/profile.api";
import { useAuthStore } from "../stores/auth.store";

export function AuthInitializer() {
  const userSession = useAuthStore((state) => state.userSession);
    const setUser = useAuthStore((state) => state.setUser);

  async function getUserProfile(
      username: string,
    ): Promise<UserProfile | undefined> {
      const response = await fetchUserProfile(username);
      if (response && typeof response === "object") {
        return {
          id: response.id,
          name: response.full_name,
          email: response.email,
          phone: response.mobile_1,
          gender: response.gender,
          zipcode: response.zip_code,
          profilePicture: response.profile_picture,
          address: response.address,
          district: response.district,
          dsDivision: response.district_ds_division,
          gnDivision: response.gn_division,
        };
      }
    }

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      if (!userSession) return;

      try {
        const user = await getUserProfile(userSession.username);
        if (!cancelled && user) {
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

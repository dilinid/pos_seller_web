import { create } from "zustand";
import type {  UserSession } from "../types/auth.type";
import { persist } from "zustand/middleware";
import type { UserProfile } from "../types/profile.type";


interface AuthState {
    userSession: UserSession | null;
    user: UserProfile | null;

    setUserSession: (userSession: UserSession | null) => void;
    setUser: (user: UserProfile) => void;
    clearState: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            userSession: null,
            user: null,
            
            setUserSession: (userSession: UserSession | null) => set({ userSession}),
            setUser: (user: UserProfile) => set({ user }),
            clearState: () => set({ userSession: null, user: null }),
        }),
        {
            partialize: (state) => ({
                userSession: state.userSession,
                user: state.user
            }),

            name: "auth-store",
        }
    )
);
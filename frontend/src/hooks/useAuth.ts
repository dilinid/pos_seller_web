import { useState } from "react";
import { useAuthStore } from "../stores/auth.store";
import { useMarketplaceStore } from "../stores/marketplace.store";
import { useStoreStore } from "../stores/store.store";
import { useCODStore } from "../stores/cod.store";
import { useDashboardStore } from "../stores/dashboard.store";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile } from "../apis/profile.api";
import { loginApi } from "../apis/auth.api";
import { buildFallbackProfile, mapProfileResponse } from "../utils/profile.utils";

// Every store below persists (or otherwise holds) data scoped to whichever
// account is signed in — cart, orders, store profile, COD status. None of it
// is cleared automatically on a session boundary, so without this a second
// account signing in on the same browser would see the first account's data.
// Called on both login and logout so a non-clean exit (closed tab, expired
// token) can't leak into the next session either.
function resetAccountScopedStores() {
  useMarketplaceStore.getState().resetAccountState();
  useStoreStore.getState().resetProfile();
  useCODStore.getState().resetCOD();
  useDashboardStore.getState().clearState();
}

// Bounds match the backend `it_user_master.user_name`/`password` column widths.
const MAX_USERNAME_LENGTH = 50;
const MAX_PASSWORD_LENGTH = 500;

export function useAuth() {
  const navigate = useNavigate();
  const { userSession, user, setUserSession, clearState, setUser } =
    useAuthStore();
  const isAuthenticated = Boolean(userSession);

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRedirect = () => {
    const redirect = localStorage.getItem("auth_redirect") || "/";
    localStorage.removeItem("auth_redirect");
    navigate(redirect);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUserName = userName.trim();

    if (!trimmedUserName || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (trimmedUserName.length > MAX_USERNAME_LENGTH) {
      setError(`Username must be at most ${MAX_USERNAME_LENGTH} characters`);
      return;
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
      setError(`Password must be at most ${MAX_PASSWORD_LENGTH} characters`);
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await loginApi(trimmedUserName, password);
      // Wipe any previous account's leftover state before this one's data starts loading.
      resetAccountScopedStores();
      setUserSession({
        accessToken: response.access_token,
        username: response.user_name || trimmedUserName,
        userRole: response.user_role,
        name: response.name,
      });

      const username = response.user_name || trimmedUserName;
      try {
        const profileResponse = await fetchUserProfile(username);
        setUser(mapProfileResponse(profileResponse));
      } catch {
        // Fallback user profile if profile service endpoint is unavailable
        setUser(buildFallbackProfile({ username, name: response.name || trimmedUserName }));
      }
      handleRedirect();
    } catch (err: any) {
      console.error(err);
      const message = err.response?.data?.detail || "Invalid credentials. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  function logout() {
    resetAccountScopedStores();
    clearState();
    navigate("/");
  }

  return {
    isAuthenticated,
    userSession,
    userName,
    user,
    setUser,
    setUserName,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    error,
    setError,
    loading,
    setLoading,
    handleSubmit,
    handleRedirect,
    logout,
  };
}

import { useState } from "react";
import { useAuthStore } from "../stores/auth.store";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile } from "../apis/profile.api";
import type { UserProfile } from "../types/profile.type";
import { loginApi } from "../apis/auth.api";

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
    if (!userName || !password) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await loginApi(userName, password);
      if (response && response.access_token) {
        setUserSession({
          accessToken: response.access_token,
          username: response.user_name || userName,
          userRole: response.user_role,
          name: response.name,
        });

        try {
          const userProfile = await getUserProfile(response.user_name || userName);
          if (userProfile) {
            setUser(userProfile);
          }
        } catch {
          // Fallback user profile if profile service endpoint is unavailable
          setUser({
            id: String(response.user_name || userName),
            name: response.name || userName,
            email: "",
            phone: "",
            gender: "",
            zipcode: "",
            profilePicture: "",
            address: "",
          });
        }
        handleRedirect();
      } else {
        setError("Invalid username or password.");
      }
    } catch (err: any) {
      console.error(err);
      const message = err.response?.data?.detail || "Invalid credentials. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  async function getUserProfile(
    username: string,
  ): Promise<UserProfile | undefined> {
    const response = await fetchUserProfile(username);
    if (response) {
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

  function logout() {
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

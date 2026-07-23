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
  const [ssoLoading, setSsoLoading] = useState(false);
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
      if (response) {
        setUserSession({
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
          username: userName,
        });
        const user = await getUserProfile(userName);
        if (user) {
          setUser(user);
          handleRedirect();
        } else {
          setError("An error occurred. Please try again.");
        }
      } else {
        setError("Invalid credentials. Please register first.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
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
    ssoLoading,
    setSsoLoading,
    handleSubmit,
    handleRedirect,
    logout,
  };
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import { fetchUserProfile } from "../apis/profile.api";
import { signupApi } from "../apis/auth.api";
import { buildFallbackProfile, mapProfileResponse } from "../utils/profile.utils";

// Bounds match the backend `pos_customer`/`it_user_master` column widths.
const MAX_NAME_LENGTH = 60;
const MAX_EMAIL_LENGTH = 40;
const MAX_PHONE_LENGTH = 30;
const MAX_ADDRESS_LENGTH = 40;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 500;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useSignup() {
  const navigate = useNavigate();
  const { setUserSession, setUser } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();

    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      setError("Please fill in all required fields");
      return;
    }
    if (trimmedName.length > MAX_NAME_LENGTH) {
      setError(`Name must be at most ${MAX_NAME_LENGTH} characters`);
      return;
    }
    if (trimmedEmail.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(trimmedEmail)) {
      setError("Enter a valid email address");
      return;
    }
    if (trimmedPhone.length > MAX_PHONE_LENGTH) {
      setError(`Phone number must be at most ${MAX_PHONE_LENGTH} characters`);
      return;
    }
    if (trimmedAddress.length > MAX_ADDRESS_LENGTH) {
      setError(`Address must be at most ${MAX_ADDRESS_LENGTH} characters`);
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
      setError(`Password must be at most ${MAX_PASSWORD_LENGTH} characters`);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await signupApi({
        name: trimmedName,
        email: trimmedEmail,
        password,
        phone: trimmedPhone || undefined,
        address: trimmedAddress || undefined,
      });

      setUserSession({
        accessToken: response.access_token,
        username: response.user_name || trimmedEmail,
        userRole: response.user_role,
        name: response.name,
      });

      const username = response.user_name || trimmedEmail;
      try {
        const profileResponse = await fetchUserProfile(username);
        setUser(mapProfileResponse(profileResponse));
      } catch {
        // Fallback user profile if profile service endpoint is unavailable
        setUser(
          buildFallbackProfile({
            username,
            name: response.name || trimmedName,
            email: trimmedEmail,
            phone: trimmedPhone,
            address: trimmedAddress,
          }),
        );
      }

      navigate("/");
    } catch (err: any) {
      console.error(err);
      const message = err.response?.data?.detail || "Failed to create account. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
    phone,
    setPhone,
    address,
    setAddress,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    error,
    loading,
    handleSubmit,
  };
}

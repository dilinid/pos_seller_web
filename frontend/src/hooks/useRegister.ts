import { useNavigate } from "react-router-dom";
import type { RegisterRequest } from "../types/auth.type";
import { useState } from "react";
import { registerNewUser } from "../apis/auth.api";
import axios from "axios";

const initialRegisterState: RegisterRequest = {
  username: "",
  fullname: "",
  email: "",
  nic: "",
  dob: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
};

export function useRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState<RegisterRequest>(initialRegisterState);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [ssoLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function handleChanges(key: string, value: string) {
    setFormData({
      ...formData,
      [key]: value,
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFileds()) return;

    setError("");
    setLoading(true);
    try {
      const response = await registerNewUser(formData);
      if (response) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setError("Phone number or email is already registered.");
      }
    } catch (e) {
      console.error(e);

      if (axios.isAxiosError(e)) {
        setError(
          e.response?.data?.message ||
            e.response?.data?.error ||
            "Failed to create account.",
        );
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  function validateFileds() {
    if (!formData.username) {
      setError("Please enter a username");
      return false;
    }

    if (!formData.fullname) {
      setError("Please enter your full name");
      return false;
    }

    if (!formData.email) {
      setError("Please enter your email");
      return false;
    }

    if (!formData.nic) {
      setError("Please enter your NIC number");
      return false;
    }

    if (!formData.dob) {
      setError("Please enter your date of birth");
      return false;
    }

    if (!formData.phoneNumber) {
      setError("Please enter your phone number");
      return false;
    }

    if (!formData.password) {
      setError("Please enter a password");
      return false;
    }

    if (!formData.confirmPassword) {
      setError("Please confirm your password");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  }

  return {
    formData,
    showPassword,
    loading,
    ssoLoading,
    success,
    error,
    handleChanges,
    handleSubmit,
    setShowPassword,
  };
}

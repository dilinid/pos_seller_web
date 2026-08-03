import { useEffect, useRef, useState } from "react";
import {
  fetchDistricts,
  fetchDsDivisions,
  fetchGnDivisions,
  fetchUserProfile,
  updateUserProfile,
} from "../apis/profile.api";
import type {
  District,
  DsDivision,
  GnDivision,
  UserProfile,
} from "../types/profile.type";
import { useAuthStore } from "../stores/auth.store";
import axios from "axios";

const defaultProfile: UserProfile = {
  id: "",
  name: "",
  email: "",
  phone: "",
  profilePicture: "",
  address: "",
  gender: "",
  zipcode: "",
  district: undefined,
  dsDivision: undefined,
  gnDivision: undefined,
};

export function useProfile() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const userSession = useAuthStore((state) => state.userSession);

  const [profile, setProfile] = useState<UserProfile>(user || defaultProfile);
  const [districts, setDistricts] = useState<District[]>([]);
  const [dsDivisions, setDsDivisions] = useState<DsDivision[]>([]);
  const [gnDivisions, setGnDivisions] = useState<GnDivision[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleProfileImageClick = () => {
    if (profileImg) {
      setProfileImg(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    setProfileImg(file);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      await updateUserProfile({
        profilePicture: profileImg ? await convertImage(profileImg) : undefined,
        gender: profile.gender,
        gnDivisionId: profile.gnDivision?.id,
        address: profile.address,
        zipcode: profile.zipcode,
      });
      setUser(profile);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(
          err.response?.data.message || "Failed to update profile registry",
        );
      } else {
        alert("Failed to update profile registry");
      }
    } finally {
      setSaveLoading(false);
    }
  };

  function convertImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const result = reader.result as string;

        // Remove "data:image/jpeg;base64," part
        const base64 = result.split(",")[1];

        resolve(base64);
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsDataURL(file);
    });
  }

  function handleChanges(key: string, value: unknown) {
    setProfile((prev) => {
      const next = {
        ...prev,
        [key]: value,
      };

      if (key === "district") {
        next.dsDivision = undefined;
        next.gnDivision = undefined;
      }

      if (key === "dsDivision") {
        next.gnDivision = undefined;
      }

      return next;
    });

    if (key === "district" && value) {
      getGsDivisions((value as District).id);
    }

    if (key === "dsDivision" && value) {
      getGnDivisions((value as DsDivision).id);
    }
  }

  async function getUserProfile(
    username: string,
  ): Promise<UserProfile | undefined> {
    const response = await fetchUserProfile(username);
    if (response && typeof response === "object") {
      return {
        id: response.id,
        name: response.full_name,
        email: response.email,
        gender: response.gender,
        zipcode: response.zip_code,
        phone: response.mobile_1,
        profilePicture: response.profile_picture,
        address: response.address,
        district: response.district,
        dsDivision: response.district_ds_division,
        gnDivision: response.gn_division
      };
    }
  }

  async function getDistricts(): Promise<void> {
    try {
      const response = await fetchDistricts();
      setDistricts(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error(err);
      setDistricts([]);
    }
  }

  async function getGsDivisions(districtId: string) {
    try {
      const response = await fetchDsDivisions(districtId);
      setDsDivisions(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    }
  }

  async function getGnDivisions(DsDivisionId: string) {
    try {
      const response = await fetchGnDivisions(DsDivisionId);
      setGnDivisions(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    }
  }

  useEffect(() => {
    const loadData = async () => {
      if (!userSession) return;
      try {
        setLoading(true);
        const res = await getUserProfile(userSession.username);
        if (res) {
          setUser(res);
        }

        getDistricts();
        if (profile.district) {
          getGsDivisions(profile.district.id);
          if (profile.dsDivision) {
            getGnDivisions(profile.dsDivision.id);
          }
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    user,
    profile,
    districts,
    dsDivisions,
    gnDivisions,
    loading,
    saveLoading,
    saveSuccess,
    error,
    profileImg,
    fileInputRef,
    handleProfileImageClick,
    handleProfileImageChange,
    handleProfileSave,
    handleChanges,
  };
}

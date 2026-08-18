import { useEffect, useRef, useState } from "react";
import {
  fetchDistricts,
  fetchDsDivisions,
  fetchGnDivisions,
  updateUserProfile,
} from "../apis/profile.api";
import { updateMyContactInfo } from "../apis/auth.api";
import type {
  District,
  DsDivision,
  GnDivision,
  UserProfile,
} from "../types/profile.type";
import { useAuthStore } from "../stores/auth.store";
import { fetchMergedUserProfile } from "../utils/profile.utils";
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
      // Gender, District/DS/GN Division, and Address are persisted to pos_customer
      // via this app's own backend (address is split across cus_add1-4 there).
      const contact = await updateMyContactInfo({
        gender: profile.gender,
        districtId: profile.district?.id ?? "",
        dsDivisionId: profile.dsDivision?.id ?? "",
        gnDivisionId: profile.gnDivision?.id ?? "",
        address: profile.address,
      });

      // Zipcode/profile picture still go through the external member portal —
      // best-effort, since that service isn't reachable in every environment and
      // shouldn't block saving the update above.
      await updateUserProfile({
        profilePicture: profileImg ? await convertImage(profileImg) : undefined,
        zipcode: profile.zipcode,
      }).catch((err) => console.error(err));

      // `contact` is the fresh post-save response, not a partial fetch — use its
      // values as-is (including `null` for a field the user just cleared) rather
      // than falling back to the pre-save `profile`, which would resurrect it.
      const updated: UserProfile = {
        ...profile,
        gender: contact.gender ?? "",
        address: contact.address ?? "",
        district: contact.district ?? undefined,
        dsDivision: contact.dsDivision ?? undefined,
        gnDivision: contact.gnDivision ?? undefined,
      };
      setUser(updated);
      setProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(
          err.response?.data?.detail || err.response?.data?.message || "Failed to update profile registry",
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

        // Same merge AuthInitializer/login use (fetchMergedUserProfile) —
        // both pos_customer (own backend, authoritative) and the external
        // member portal are independently best-effort inside it.
        const merged: UserProfile = {
          ...defaultProfile,
          ...(await fetchMergedUserProfile(userSession.username)),
        };
        setUser(merged);
        setProfile(merged);

        getDistricts();
        if (merged.district) {
          getGsDivisions(merged.district.id);
          if (merged.dsDivision) {
            getGnDivisions(merged.dsDivision.id);
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

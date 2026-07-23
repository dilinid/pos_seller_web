import { api } from "../shared/axios";
import type {
  District,
  DsDivision,
  ProfileResponse,
  UpdateProfile,
} from "../types/profile.type";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchUserProfile = async (
  username: string,
): Promise<ProfileResponse> => {
  const response = await api.get(`${BASE_URL}/settings/userDetails`, {
    params: {
      username: username,
    },
  });

  return response.data;
};

export const updateUserProfile = async (
  data: Partial<UpdateProfile>,
): Promise<void> => {
  await api.put(`${BASE_URL}/client/me`, data);
};

export async function fetchDistricts(): Promise<District[]> {
  const response = await api.get(`${BASE_URL}/location/districts`);
  return response.data;
}

export async function fetchDsDivisions(
  districtId: string,
): Promise<DsDivision[]> {
  const response = await api.get(
    `${BASE_URL}/location/district/${districtId}/gs-divisions`,
  );
  return response.data;
}

export async function fetchGnDivisions(
  DsDivisionId: string,
): Promise<DsDivision[]> {
  const response = await api.get(
    `${BASE_URL}/location/gs-division/${DsDivisionId}/gn-divisions`,
  );
  return response.data;
}

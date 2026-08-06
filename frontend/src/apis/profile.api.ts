import { api } from "../shared/axios";
import type {
  District,
  DsDivision,
  ProfileResponse,
  UpdateProfile,
} from "../types/profile.type";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

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

// District/DS-division/GN-division lookups are served by this app's own backend
// (seeded once from openadmindata.org) rather than the external member portal —
// that service is a separate, often-unreachable dependency and doesn't need to
// gate this data.
const LOCATION_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export async function fetchDistricts(): Promise<District[]> {
  const response = await api.get(`${LOCATION_BASE_URL}/location/districts`);
  return response.data;
}

export async function fetchDsDivisions(
  districtId: string,
): Promise<DsDivision[]> {
  const response = await api.get(
    `${LOCATION_BASE_URL}/location/districts/${districtId}/ds-divisions`,
  );
  return response.data;
}

export async function fetchGnDivisions(
  DsDivisionId: string,
): Promise<DsDivision[]> {
  const response = await api.get(
    `${LOCATION_BASE_URL}/location/ds-divisions/${DsDivisionId}/gn-divisions`,
  );
  return response.data;
}

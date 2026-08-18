import type { ProfileResponse, UserProfile } from '../types/profile.type';
import { fetchMyContactInfo } from '../apis/auth.api';
import { fetchUserProfile } from '../apis/profile.api';

export function mapProfileResponse(response: ProfileResponse): UserProfile {
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

/** The single source of truth for hydrating useAuthStore's `user` — merges
 * this app's own backend (fetchMyContactInfo, pos_customer: authoritative for
 * name/phone/email/gender/address/district) with the external member portal
 * (fetchUserProfile: adds zipcode/profilePicture, and is the only fallback if
 * pos_customer has nothing for a field). `contact` wins wherever it has a
 * value.
 *
 * Used on login and on app-boot session restore (AuthInitializer) so the
 * Navbar/checkout address never depend on the user having visited the
 * Profile page first — before this existed, only useProfile's own duplicate
 * of this merge ran (Profile page only), so name/address stayed
 * external-portal-only (often blank) everywhere else until then. Both
 * sources are independently best-effort: either being unreachable degrades
 * gracefully rather than failing the whole merge. */
export async function fetchMergedUserProfile(username: string): Promise<UserProfile> {
  const [contact, external] = await Promise.all([
    fetchMyContactInfo().catch(() => null),
    fetchUserProfile(username).then(mapProfileResponse).catch(() => undefined),
  ]);

  return {
    id: external?.id ?? username,
    name: contact?.name ?? external?.name ?? '',
    email: contact?.email ?? external?.email ?? '',
    phone: contact?.phone ?? external?.phone ?? '',
    gender: contact?.gender ?? external?.gender ?? '',
    zipcode: external?.zipcode ?? '',
    profilePicture: external?.profilePicture ?? '',
    address: contact?.address ?? external?.address ?? '',
    district: contact?.district ?? external?.district ?? undefined,
    dsDivision: contact?.dsDivision ?? external?.dsDivision ?? undefined,
    gnDivision: contact?.gnDivision ?? external?.gnDivision ?? undefined,
  };
}

export function buildFallbackProfile(params: {
  username: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}): UserProfile {
  return {
    id: params.username,
    name: params.name,
    email: params.email || '',
    phone: params.phone || '',
    gender: '',
    zipcode: '',
    profilePicture: '',
    address: params.address || '',
  };
}

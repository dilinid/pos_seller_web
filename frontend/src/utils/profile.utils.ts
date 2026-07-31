import type { ProfileResponse, UserProfile } from '../types/profile.type';

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

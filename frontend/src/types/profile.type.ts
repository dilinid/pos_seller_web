export interface ProfileResponse {
    id: string;
    full_name: string;
    mobile_1: string;
    nic: string;
    profile_picture: string;
    email: string;
    userName: string;
    ini_name: string;
    title: string;
    address: string;
    zip_code: string;
    district_state_id: string;
    gender: string;
    date_of_birth: string;
    mobile_2: string;
    home_phone: string;
    status: string;
    mobile_verify: string;
    force_password_change: string;
    district: District;
    district_ds_division: DsDivision;
    gn_division: GnDivision;
}

export interface GnDivision {
    name: string;
    id: string;
}

export interface District {
    name: string;
    id: string;
}

export interface DsDivision {
    name: string;
    id: string;
}


export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    memberId?: string;
    joinDate?: string;
    membershipType?: 'Platinum' | 'Gold' | 'Silver';
    profilePicture?: string;
    address?: string;
    gender?: string;
    zipcode?: string
    district?: District
    dsDivision?: DsDivision
    gnDivision?: GnDivision
}

export interface UpdateProfile {
    profilePicture: string;
    address: string;
    gender: string;
    gnDivisionId: string;
    zipcode: string
}

export interface RegisterRequest {
    username: string;
    fullname: string;
    email: string;
    nic: string;
    dob: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
}


export interface UserSession {
    accessToken: string;
    refreshToken: string;
    username: string;
}
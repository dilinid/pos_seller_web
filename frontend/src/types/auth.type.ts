export interface LoginResponse {
    access_token: string;
    token_type?: string;
    user_role?: string;
    user_name?: string;
    name?: string;
}

export interface UserSession {
    accessToken: string;
    username: string;
    userRole?: string;
    name?: string;
}
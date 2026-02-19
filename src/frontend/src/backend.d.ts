import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Language = string;
export interface Message {
    content: string;
    recipient: Principal;
    sender: Principal;
    timestamp: bigint;
}
export interface MatchAction {
    user: Principal;
    timestamp: bigint;
}
export interface ShortProfile {
    age: bigint;
    bio: string;
    fullName: string;
    nativeLanguages: Array<Language>;
    targetLanguages: Array<Language>;
    currentStatus: Status;
}
export interface UserProfile {
    age: bigint;
    bio: string;
    interests: Array<string>;
    fullName: string;
    sentMatchRequests: Array<Principal>;
    matches: Array<Principal>;
    nativeLanguages: Array<Language>;
    targetLanguages: Array<Language>;
    lastActive: bigint;
    currentStatus: Status;
    lastMessageCheck: bigint;
    receivedMatchRequests: Array<Principal>;
}
export enum Status {
    active = "active",
    offline = "offline"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createUserProfile(profileData: ShortProfile): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCurrentActiveParticipants(): Promise<Array<[Principal, Status]>>;
    getCurrentUserProfile(): Promise<UserProfile>;
    getMatches(): Promise<Array<MatchAction>>;
    getMessages(): Promise<Array<Message>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    likeUser(user: Principal): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(recipient: Principal, message: string): Promise<void>;
}

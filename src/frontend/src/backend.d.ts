import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Holding {
    asset: string;
    user: Principal;
    timestamp: Time;
    quantity: number;
    costBasis?: number;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addHolding(asset: string, quantity: number, costBasis: number | null): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteHolding(asset: string): Promise<void>;
    findHoldingsByAsset(asset: string): Promise<Array<Holding>>;
    getAllHoldings(): Promise<Array<Holding>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getHolding(asset: string): Promise<Holding | null>;
    getHoldings(): Promise<Array<Holding>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateHolding(asset: string, newQuantity: number, newCostBasis: number | null): Promise<void>;
}

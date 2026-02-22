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
    purchaseDate: Time;
    saleHistory: Array<SaleRecord>;
    currentQuantity: number;
    quantity: number;
    costBasis?: number;
}
export interface SaleRecord {
    quantitySold: number;
    salePrice: number;
    saleDate: Time;
}
export type TransactionType = {
    __kind__: "buy";
    buy: number;
} | {
    __kind__: "sell";
    sell: number;
};
export interface UserProfile {
    name: string;
}
export interface Transaction {
    shares: number;
    transactionType: TransactionType;
    pricePerShare?: number;
    totalValue: number;
    date: Time;
    assetSymbol: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addHolding(asset: string, quantity: number, costBasis: number | null): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    calculateProfitLoss(): Promise<{
        totalProfitLoss: number;
        totalSold: bigint;
    }>;
    deleteHolding(asset: string): Promise<void>;
    findHoldingsByAsset(asset: string): Promise<Array<Holding>>;
    getAllHoldings(): Promise<Array<Holding>>;
    getAllTransactions(): Promise<Array<Transaction>>;
    getArchivedHoldings(): Promise<Array<Holding>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFullArchive(): Promise<Array<Holding>>;
    getHolding(asset: string): Promise<Holding | null>;
    getHoldings(): Promise<Array<Holding>>;
    getTransactionHistory(asset: string): Promise<Array<Holding>>;
    getUnsoldHoldings(): Promise<Array<Holding>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    recordSale(asset: string, quantitySold: number, salePrice: number): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateHolding(asset: string, newQuantity: number, newCostBasis: number | null): Promise<void>;
}

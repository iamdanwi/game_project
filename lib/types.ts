export interface FancyBet {
    name: string;
    minBet: number;
    maxBet: string | number;
    no: { odds: string; stake: string; isSuspended?: boolean };
    yes: { odds: string; stake: string; isSuspended?: boolean };
    slidingText?: string;
}

export interface Profile {
    id: number;
    name: string;
    email: string;
    mobile: string | null;
    email_verified_at: string | null;
    tfver: string;
    emailv: string;
    vercode: string;
    balance: string;
    gender: string | null;
    address: string | null;
    zip_code: string | null;
    city: string | null;
    country: string | null;
    vsent: string | null;
    secretcode: string;
    tauth: string;
    ref_id: string | null;
    referral_token: string;
    status: string;
    created_at: string;
    updated_at: string;
    image: string | null;
    image_url: string;
}

export interface EventData {
    event: {
        id: string;
        name: string;
        countryCode: string;
        timezone: string;
        openDate: string;
    };
    bfid: string;
    marketCount: number;
    marketIds: Array<{
        marketId: string;
        marketName: string;
        marketStartTime: string;
        totalMatched: string;
    }>;
    scoreboard_id: string;
    selections: string;
    liability_type: number;
    undeclared_markets: number;
    odds?: {
        runners: Array<{
            selectionId: string;
            runner: string;
            ex?: {
                availableToBack?: Array<{
                    price: number;
                    size: number;
                }>;
                availableToLay?: Array<{
                    price: number;
                    size: number;
                }>;
            };
        }>;
    };
}

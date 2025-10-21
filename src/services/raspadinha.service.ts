import { apiRequest, ApiResponse } from "@/lib/api";

interface PlayRaspadinhaRequest {
    saleId: number;
    clientSeed: string;
}

interface PrizeDetails {
    type: string;
    value: number;
    description?: string;
}

interface DebugVerification {
    phpCalculateRoll: string;
    verifyUrl: string;
}

interface DebugInfo {
    mainRoll: number;
    verification: DebugVerification;
}

interface PlayRaspadinhaResult {
    squares: string[];
    wonPrize: number | null;
    wonPrizeDetails: PrizeDetails | null;
    debug: DebugInfo;
}

interface PlayRaspadinhaResponse {
    message: string;
    result: PlayRaspadinhaResult;
}

const playRaspadinha = async (
    request: PlayRaspadinhaRequest
): Promise<ApiResponse<PlayRaspadinhaResponse>> => {
    return apiRequest<PlayRaspadinhaResponse>("/play-raspadinha", {
        method: "POST",
        body: JSON.stringify(request),
    });
};

export const raspadinhaService = {
    playRaspadinha,
};

export type {
    PlayRaspadinhaRequest,
    PlayRaspadinhaResponse,
    PlayRaspadinhaResult,
    PrizeDetails,
    DebugInfo,
};


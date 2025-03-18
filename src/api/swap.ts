import { http } from "@/shared/utils/request";
import { message } from "antd";

const tokenPairApi = "/swap/tokenpair/list";
const approveApi = "/swap/generate/approve";
const swapPayloadApi = "/swap/generate/payload";

type TokenPairList = {
  explorer_url: string;
  swap_route: string;
  tokenpairs: TokenPair[];
};

type TokenPair = {
  name: string;
  icon: string;
  address: string;
  symbol: string;
  decimals: number;
};

type ApproveParams = {
  tokenAddress: string;
  spender: string;
  amount: string;
  owner: string;
};

type SwapPayloadParams = {
  userAddress: string;
  tokenIn: string;
  tokenOut: string;
  swapAmount: string;
  swapContract: string;
  useDestinationAddress: boolean;
  destinationAddress?: string;
};

const handleError = (error: unknown) => {
  message.error(
    error instanceof Error ? error.message : "Network request failed"
  );
};

export const fetchTokenPairList = async (): Promise<TokenPairList | null> => {
  try {
    return await http.get(tokenPairApi);
  } catch (error) {
    handleError(error);
    return null;
  }
};

export const fetchApproveCallData = async (
  params: ApproveParams
): Promise<any> => {
  try {
    return await http.post(approveApi, params);
  } catch (error) {
    handleError(error);
    return null;
  }
};

export const fetchSwapPayload = async (
  params: SwapPayloadParams
): Promise<any> => {
  try {
    return await http.post(swapPayloadApi, params);
  } catch (error) {
    handleError(error);
    return null;
  }
};

import { useState, useCallback } from "react";

type LoadingKeys = "approve" | "swap";
type LoadingActions = {
  setApproveLoading: (status: boolean) => void;
  setSwapLoading: (status: boolean) => void;
};

export const useLoading = (
  initialState: Record<LoadingKeys, boolean>
): [Record<LoadingKeys, boolean>, LoadingActions] => {
  const [loading, setLoading] = useState(initialState);

  const setApproveLoading = useCallback((status: boolean) => {
    setLoading((prev) => ({ ...prev, approve: status }));
  }, []);

  const setSwapLoading = useCallback((status: boolean) => {
    setLoading((prev) => ({ ...prev, swap: status }));
  }, []);

  return [loading, { setApproveLoading, setSwapLoading }];
};

import { useState, useCallback } from "react";

interface Token {
  address: string;
  symbol: string;
  name: string;
  icon: string;
  decimals: number;
}

type TokenState = {
  list: Token[];
  in: Token;
  out: Token;
};

type TokenActions = {
  setInToken: (token: Token) => void;
  setOutToken: (token: Token) => void;
  swapTokens: () => void;
  updateTokenList: (newList: Token[]) => void;
};

const useTokenManagement = (
  initialList: Token[]
): [TokenState, TokenActions] => {
  const [tokenState, setTokenState] = useState<TokenState>({
    list: initialList,
    in: initialList[0],
    out: initialList[1],
  });

  const getSafeToken = useCallback((list: Token[], index: number) => {
    return list[index] || list[0];
  }, []);

  const setInToken = useCallback((token: Token) => {
    setTokenState((prev) => {
      const shouldSwap = token.symbol === prev.out.symbol;
      return {
        ...prev,
        in: token,
        out: shouldSwap ? prev.in : prev.out,
      };
    });
  }, []);

  const setOutToken = useCallback((token: Token) => {
    setTokenState((prev) => {
      const shouldSwap = token.symbol === prev.in.symbol;
      return {
        ...prev,
        out: token,
        in: shouldSwap ? prev.out : prev.in,
      };
    });
  }, []);

  const swapTokens = useCallback(() => {
    setTokenState((prev) => ({
      ...prev,
      in: prev.out,
      out: prev.in,
    }));
  }, []);

  const updateTokenList = useCallback(
    (newList: Token[]) => {
      setTokenState((prev) => ({
        list: newList,
        in: getSafeToken(
          newList,
          newList.findIndex((t) => t.symbol === prev.in.symbol)
        ),
        out: getSafeToken(
          newList,
          newList.findIndex((t) => t.symbol === prev.out.symbol)
        ),
      }));
    },
    [getSafeToken]
  );

  return [
    tokenState,
    {
      setInToken,
      setOutToken,
      swapTokens,
      updateTokenList,
    },
  ];
};

export default useTokenManagement;

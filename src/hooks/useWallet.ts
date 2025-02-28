import { useState } from "react";
import { BrowserProvider, ethers } from "ethers";
import { useNetwork } from "@/hooks/useNetwork";

export const useWallet = () => {
  const { verifyNetwork, switchNetwork } = useNetwork();
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  const connect = async () => { 
    if (!window.ethereum) throw new Error("Please install wallet"); 
    const provider = new BrowserProvider(window.ethereum);
    if (!(await verifyNetwork(provider))) { 
      await switchNetwork();
      return connect();
    }

    setProvider(provider);
    const newSigner = await provider.getSigner();
    setSigner(newSigner);
    setUserAddress((await newSigner.getAddress()) ?? null);
  };

  return { provider, signer, connect, userAddress };
};

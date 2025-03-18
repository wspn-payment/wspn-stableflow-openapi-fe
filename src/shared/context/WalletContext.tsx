import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { BrowserProvider, ethers } from 'ethers';
import { useNetwork } from '@/shared/hooks/useNetwork';
import { NETWORKS } from '../hooks/useNetwork';

interface WalletContextType {
  provider: BrowserProvider | null;
  signer: ethers.Signer | null;
  userAddress: string | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { verifyNetwork, switchNetwork } = useNetwork();
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const setupNetworkListener = () => {
    if (!window.ethereum) return;
    
    // Remove any existing listeners to prevent duplicates
    window.ethereum.removeListener('chainChanged', handleChainChanged);
    
    // Add new listener
    window.ethereum.on('chainChanged', handleChainChanged);
  };

  const handleChainChanged = (chainId: string) => {
    if (chainId !== NETWORKS.SEPOLIA.HEX_CHAIN_ID) {
      console.warn('Network changed, reconnecting...');
      connect();
    }
  };

  const connect = async () => { 
    if (!window.ethereum) throw new Error('Please install wallet'); 
    if (isConnecting) return;
    try {
      setIsConnecting(true);
      const provider = new BrowserProvider(window.ethereum);
      if (!(await verifyNetwork(provider))) { 
        await switchNetwork();
        return connect();
      }

      setProvider(provider);
      const newSigner = await provider.getSigner();
      setSigner(newSigner);
      setUserAddress((await newSigner.getAddress()) ?? null);
      
      // Setup network listener after successful connection
      setupNetworkListener();
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setUserAddress(null);
  };

  // Setup network listener when component mounts
  useEffect(() => {
    if (provider && userAddress) {
      setupNetworkListener();
    }
    
    // Cleanup listener when component unmounts
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [provider, userAddress]);

  return (
    <WalletContext.Provider
      value={{
        provider,
        signer,
        userAddress,
        isConnecting,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
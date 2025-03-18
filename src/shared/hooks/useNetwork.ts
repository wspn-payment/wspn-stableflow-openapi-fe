import { BrowserProvider, ethers } from "ethers";
import { abi } from "../../contracts/index";
const rpcUrl = import.meta.env.VITE_ETH_RPC_URL;
const blockchainUrl = import.meta.env.VITE_ETH_BLOCKCHAIN_URL;
export const NETWORKS = {
  SEPOLIA: {
    CHAIN_ID: 11155111,
    HEX_CHAIN_ID: "0xaa36a7",
    NAME: "Sepolia Testnet",
    RPC_URL: rpcUrl,
    EXPLORER_URL: blockchainUrl,
    CURRENCY: {
      NAME: "ETH",
      SYMBOL: "ETH",
      DECIMALS: 18,
    },
  },
};

export const getTokenBalance = async (
  contractAddress: string,
  decimals: number,
  userAddress: string,
  provider: BrowserProvider
) => {
  const contract = new ethers.Contract(contractAddress, abi.ERC20_ABI, provider);
  const balance = await contract.balanceOf(userAddress);
  return ethers.formatUnits(balance, decimals);
};

export const useNetwork = () => {
  const verifyNetwork = async (provider: BrowserProvider) => {
    const network = await provider.getNetwork();
    return network.chainId === BigInt(NETWORKS.SEPOLIA.CHAIN_ID);
  };

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: NETWORKS.SEPOLIA.HEX_CHAIN_ID }],
      });
      return true;
    } catch (error) {
      if (error.code === 4902) {
        return await addNetwork();
      }
      throw new Error(`Network switch failed: ${error.message}`);
    }
  };

  const addNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: NETWORKS.SEPOLIA.HEX_CHAIN_ID,
            chainName: NETWORKS.SEPOLIA.NAME,
            rpcUrls: [NETWORKS.SEPOLIA.RPC_URL],
            nativeCurrency: NETWORKS.SEPOLIA.CURRENCY,
            blockExplorerUrls: [NETWORKS.SEPOLIA.EXPLORER_URL],
          },
        ],
      });
      return true;
    } catch (error) {
      throw new Error(`Network add failed: ${error.message}`);
    }
  };

  return { verifyNetwork, switchNetwork };
};

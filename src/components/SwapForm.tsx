import { useState, useEffect } from "react";
import { BrowserProvider, ethers } from "ethers";
import { abi, tokenList } from "../contracts/index";
import { formatTxHash } from "../utils/format";
import {
  Button,
  Checkbox,
  Input,
  Card,
  Typography,
  Space,
  Spin,
  message,
  Select,
} from "antd";
import { SwapOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const SwapForm = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [tokenInBalance, setTokenInBalance] = useState<string>("0");
  const [tokenOutBalance, setTokenOutBalance] = useState<string>("0");
  const [amountIn, setAmountIn] = useState("1");
  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSwap, setLoadingSwap] = useState(false);
  const [tokens, setTokens] = useState(tokenList);
  const [useDestinationAddress, setUseDestinationAddress] = useState(false);
  const [destinationAddress, setDestinationAddress] = useState("");
  const [tokenIn, setTokenIn] = useState(tokens[0]);
  const [tokenOut, setTokenOut] = useState(tokens[1]);
  const [swapRout, setSwapRout] = useState("");
  const [explorerUrl, setExplorerUrl] = useState("");
  const rpcUrl = import.meta.env.VITE_ETH_RPC_URL;
  const blockchainUrl = import.meta.env.VITE_ETH_BLOCKCHAIN_URL;
  const apibaseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    updateTokenBalance(1);
  }, [tokenIn]);

  useEffect(() => {
    updateTokenBalance(2);
  }, [tokenOut]);

  useEffect(() => {
    if (!provider || !signer) return;
    reloadBalance();
    const fetchTokenData = async () => {
      try {
        const data = await fetchTokenPirList();
        if (data && data.swap_route) {
          setSwapRout(data.swap_route);
          setExplorerUrl(data.explorer_url);
          setTokens(data.tokenpairs);
        }
      } catch (error) {
        message.error("Request tokenpair list failed!");
      }
    };
    fetchTokenData();
  }, [signer]);

  const reloadBalance = () => {
    updateTokenBalance(1);
    updateTokenBalance(2);
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      messageApi.error("Please install wallet!");
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      await switchNetWork(provider);
      const signer = await provider.getSigner();
      setProvider(provider);
      setSigner(signer);
    } catch (error) {
      messageApi.error(`Failed to connect wallet: ${error.message}`);
      setProvider(null);
      setSigner(null);
    }
  };

  const switchNetWork = async (provider) => { 
    const network = await provider.getNetwork();
    console.log("Current network:", network.name); 
     
    const SEPOLIA_CHAIN_ID = "0xaa36a7";
    const SEPOLIA_NETWORK_PARAMS = {
      chainId: SEPOLIA_CHAIN_ID,
      chainName: "ETH Network",
      nativeCurrency: {
        name: "ETH",
        symbol: "ETH",
        decimals: tokenIn.decimals,
      },
      rpcUrls: [rpcUrl],
      blockExplorerUrls: [blockchainUrl],
    }; 
     
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [SEPOLIA_NETWORK_PARAMS],
          });
        } catch (addError) {
          console.error("Failed to add network:", addError);
          messageApi.error("Failed to add network");
          return;
        }
      } else {
        console.error("Failed to switch network:", switchError);
        messageApi.error(`Failed to switch network：${switchError.message}`);
        return;
      }
    }
  }; 

  const updateTokenBalance = async (type: number) => {
    try {
      if (!provider || !signer || !abi.ERC20_ABI) return;
      verifySwapPair();
      const userAddress = await signer.getAddress();
      if (!userAddress) {
        throw new Error("Unable to get user address");
      }

      if (type == 1) {
        const tokenInContract = new ethers.Contract(
          tokenIn.address,
          abi.ERC20_ABI,
          provider
        );
        const inbalance = await tokenInContract.balanceOf(userAddress);
        if (!inbalance) {
          setTokenInBalance("0");
          return;
        }
        setTokenInBalance(ethers.formatUnits(inbalance, tokenIn.decimals));
      } else if (type == 2) {
        const tokenOutContract = new ethers.Contract(
          tokenOut.address,
          abi.ERC20_ABI,
          provider
        );
        const outbalance = await tokenOutContract.balanceOf(userAddress);
        if (!outbalance) {
          setTokenOutBalance("0");
          return;
        }
        setTokenOutBalance(ethers.formatUnits(outbalance, tokenOut.decimals));
      }
    } catch (balanceError) {
      setTokenInBalance("0");
      setTokenOutBalance("0");
      messageApi.error(`Failed to get balance`);
      console.error("Failed to get balance:", balanceError);
    }
  };

  const handleApprove = async () => {
    if (!provider || !signer) return;

    try {
      if (!amountIn || amountIn == "0") {
        messageApi.warning("Approve amount cannot be 0");
        return;
      }
      const allowance = await checkAllowance();
      const requiredAmount = ethers.parseUnits(amountIn, tokenIn.decimals);
      if (allowance >= requiredAmount) {
        messageApi.warning("Sufficient approved amount already exists");
        return;
      }

      setLoading(true);
      const calldata = await fetchApproveCallData();
      if (
        !calldata ||
        !calldata.to ||
        !calldata.data ||
        !calldata.gasRecommendation
      ) {
        messageApi.error(`Failed to get token authorization data`);
        return;
      }

      const trans_data = {
        to: calldata.to,
        data: calldata.data,
        value: calldata.value || "0x0",
        gasLimit: BigInt(calldata.gasRecommendation.gasLimit || "80000"),
        maxFeePerGas: BigInt(
          calldata.gasRecommendation.maxFeePerGas || "30000000000"
        ),
      };
      const tx = await signer.sendTransaction(trans_data);
      await tx.wait();
      setTxHash(tx.hash);
      messageApi.success("Approve successful!");
    } catch (error) {
      console.error("Approve failed:", error);
      if (error.code === "ACTION_REJECTED") {
        messageApi.error("Transaction was cancelled by user");
      } else {
        messageApi.error(`Approve failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!signer || !provider) return;
    if (!verifySwapPair()) return;
    if (!amountIn || amountIn == "0") {
      messageApi.warning("Swap amount cannot be 0");
      return;
    }
    const allowance = await checkAllowance();
    const requiredAmount = ethers.parseUnits(amountIn, tokenIn.decimals);
    const balanceAmount = ethers.parseUnits(
      tokenInBalance.toString(),
      tokenIn.decimals
    );

    if (allowance < requiredAmount) {
      const allowanced = ethers.formatUnits(allowance, tokenIn.decimals);
      messageApi.warning(
        `Insufficient approve amount, current approved amount: ${allowanced}, Swap limit: ${amountIn}`
      );
      return;
    }

    if (balanceAmount < requiredAmount) {
      messageApi.warning("Insufficient balance");
      return;
    }

    try {
      setLoadingSwap(true);
      const payload = await fetchSwapPayload();
      if (!payload || !payload.to || !payload.data || !payload.value) {
        messageApi.error("Failed to get SwapPayload data");
        return;
      }
      const tx = await signer.sendTransaction(payload);
      await tx.wait();
      setTxHash(tx.hash);
      reloadBalance();
      messageApi.success("Swap successful!");
    } catch (error) {
      console.error(`Swap failed:${error}`);
      if (error.code === "ACTION_REJECTED") {
        messageApi.error("Transaction was cancelled by user");
      } else {
        messageApi.error(`Swap failed: ${error.message}`);
      }
    } finally {
      setLoadingSwap(false);
    }
  };

  const verifySwapPair = () => {
    if (tokenIn.address == tokenOut.address) {
      messageApi.warning("Pair not supported. Select another");
      return false;
    }

    if (tokenIn.symbol == "USDT" && tokenOut.symbol == "USDC") {
      messageApi.warning("Pair not supported. Select another");
      return false;
    }

    if (tokenIn.symbol == "USDC" && tokenOut.symbol == "USDT") {
      messageApi.warning("Pair not supported. Select another");
      return false;
    }

    return true;
  };

  const checkAllowance = async () => {
    if (!provider || !signer) {
      return ethers.parseUnits("0", tokenIn.decimals);
    }

    try {
      const owner = await signer.getAddress();
      const tokenContract = new ethers.Contract(
        tokenIn.address,
        abi.ERC20_ABI,
        provider
      );
      const allowance = await tokenContract.allowance(owner, swapRout);
      return allowance;
    } catch (error) {
      console.error("Failed to check approve amount:", error);
      messageApi.error("Failed to check approve amount");
      return ethers.parseUnits("0", tokenIn.decimals);
    }
  };

  const fetchApproveCallData = async () => {
    if (!provider || !signer) return;
    const owner = await signer.getAddress();
    if (!swapRout) {
      messageApi.error("Failed to fetch swapRout");
      return;
    }

    const response = await fetch(apibaseUrl + "/swap/generate/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tokenAddress: tokenIn.address,
        spender: swapRout,
        amount: amountIn,
        owner: owner,
      }),
    });
    const responseJson = await response.json();
    if (responseJson?.code == 200) {
      return responseJson?.data;
    } else {
      messageApi.error(responseJson?.message);
      return null;
    }
  };

  const fetchTokenPirList = async () => {
    if (!provider || !signer) return;
    const response = await fetch(apibaseUrl + "/swap/tokenpair/list", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const responseJson = await response.json();
    if (responseJson?.code == 200) {
      return responseJson?.data;
    } else {
      messageApi.error(responseJson?.message);
      return null;
    }
  };

  const fetchSwapPayload = async () => {
    if (!provider || !signer) return;
    const owner = await signer.getAddress();
    const response = await fetch(apibaseUrl + "/swap/generate/payload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userAddress: owner,
        tokenIn: tokenIn.address,
        tokenOut: tokenOut.address,
        swapAmount: amountIn,
        swapContract: swapRout,
        useDestinationAddress: useDestinationAddress,
        destinationAddress: useDestinationAddress ? destinationAddress : "",
      }),
    });

    const responseJson = await response.json();
    if (responseJson?.code == 200) {
      return responseJson?.data;
    } else {
      messageApi.error(responseJson?.message);
      return null;
    }
  };

  return (
    <div
      style={{
        minHeight: "90vh",
        borderRadius: 10,
        background: "linear-gradient(180deg, #001529 0%, #000000 100%)",
      }}
    >
      {contextHolder}
      <Card
        style={{
          width: "100%",
          margin: "0 auto",
          background: "#141414",
          borderRadius: 16,
          border: "1px solid #303030",
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div style={{ textAlign: "center", marginTop: 30, width: "100%" }}>
            <Title level={2} style={{ color: "#fff", marginBottom: 8 }}>
              {tokenIn.symbol} <SwapOutlined /> {tokenOut.symbol}
            </Title>
            <Text style={{ color: "#13c2c2" }}>
              Hold WUSD in your own wallet to get{" "}
              <Text
                style={{
                  background: "#006d75",
                  padding: "2px 8px",
                  borderRadius: 4,
                }}
              >
                5%
              </Text>{" "}
              rewards
            </Text>
          </div>

          {!signer ? (
            <Button
              type="primary"
              size="large"
              block
              onClick={connectWallet}
              style={{ height: 48, background: "#13c2c2", marginTop: 16 }}
            >
              Connect wallet
            </Button>
          ) : (
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Card
                style={{ background: "#1f1f1f", border: "none" }}
                bodyStyle={{ padding: 16 }}
              >
                <Space
                  direction="vertical"
                  style={{ width: "100%" }}
                  size="small"
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Text style={{ color: "#fff" }}>From</Text>
                    <Text style={{ color: "#fff" }}>
                      Balance: {tokenInBalance + " " + tokenIn.symbol}
                    </Text>
                  </div>
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <Input
                      type="number"
                      value={amountIn}
                      onChange={(e) => setAmountIn(e.target.value)}
                      placeholder="0"
                      disabled={loading || loadingSwap}
                      style={{
                        background: "#fff",
                        border: "none",
                        fontSize: 24,
                        color: "gray",
                      }}
                    />
                    <Select
                      value={tokenIn.symbol}
                      onChange={(value) => {
                        const newToken = tokens.find((t) => t.symbol === value);
                        if (newToken) {
                          setTokenIn(newToken);
                        }
                      }}
                      style={{
                        width: 160,
                        height: 45,
                        background: "#2f2f2f",
                      }}
                      dropdownStyle={{
                        background: "#2f2f2f",
                      }}
                    >
                      {tokens.map((token) => (
                        <Select.Option
                          key={token.symbol}
                          value={token.symbol}
                          style={{
                            background: "#2f2f2f",
                            padding: "8px 12px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              width: "100%",
                            }}
                          >
                            <img
                              src={token.icon}
                              alt={token.symbol}
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                color: "gray",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                flex: 1,
                              }}
                            >
                              {token.symbol}
                            </span>
                          </div>
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </Space>
              </Card>

              <Card
                style={{ background: "#1f1f1f", border: "none" }}
                bodyStyle={{ padding: 16 }}
              >
                <Space
                  direction="vertical"
                  style={{ width: "100%" }}
                  size="small"
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Text style={{ color: "#fff" }}>To</Text>
                    <Text style={{ color: "#fff" }}>
                      Balance: {tokenOutBalance + " " + tokenOut.symbol}
                    </Text>
                  </div>
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <Input
                      type="number"
                      value={amountIn}
                      readOnly
                      placeholder="0"
                      style={{
                        background: "#fff",
                        border: "none",
                        fontSize: 24,
                        color: "gray",
                      }}
                    />
                    <Select
                      value={tokenOut.symbol}
                      onChange={(value) => {
                        const newToken = tokens.find((t) => t.symbol === value);
                        if (newToken) {
                          setTokenOut(newToken);
                        }
                      }}
                      style={{
                        width: 160,
                        height: 45,
                        background: "#2f2f2f",
                      }}
                      dropdownStyle={{
                        background: "#2f2f2f",
                      }}
                    >
                      {tokens.map((token) => (
                        <Select.Option
                          key={token.symbol}
                          value={token.symbol}
                          style={{
                            background: "#2f2f2f",
                            padding: "8px 12px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              width: "100%",
                            }}
                          >
                            <img
                              src={token.icon}
                              alt={token.symbol}
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                color: "gray",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                flex: 1,
                              }}
                            >
                              {token.symbol}
                            </span>
                          </div>
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </Space>
              </Card>

              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="middle"
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Checkbox
                    checked={useDestinationAddress}
                    onChange={(e) => setUseDestinationAddress(e.target.checked)}
                    style={{ color: "#fff" }}
                  >
                    Use a different destination address
                  </Checkbox>
                </div>
                <Input
                  placeholder="Enter destination wallet address"
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  disabled={!useDestinationAddress}
                  style={{
                    background: "#fff",
                    border: "1px solid #303030",
                    color: "gray",
                    height: "45px",
                  }}
                />
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handleApprove}
                  disabled={loading || loadingSwap}
                  style={{
                    height: 48,
                    background: "#13c2c2",
                    borderColor: "#13c2c2",
                  }}
                >
                  {loading ? <Spin /> : "Approve " + tokenIn.symbol}
                </Button>
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handleSwap}
                  disabled={loading || loadingSwap}
                  style={{
                    height: 48,
                    background: "#13c2c2",
                    borderColor: "#13c2c2",
                  }}
                >
                  {loadingSwap ? (
                    <Spin />
                  ) : (
                    "Swap " + tokenIn.symbol + "→" + tokenOut.symbol
                  )}
                </Button>
              </Space>

              {txHash && (
                <Text style={{ fontSize: 14, color: "#fff" }}>
                  Transaction Hash:{" "}
                  <a
                    className="text-blue-500 hover:text-blue-700"
                    href={`${explorerUrl + txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#1890ff" }}
                  >
                    {formatTxHash(txHash)}
                  </a>
                </Text>
              )}
            </Space>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default SwapForm;

import { useState, useEffect, useCallback } from "react";
import { BrowserProvider, ethers } from "ethers";
import { abi, tokenList } from "@/contracts/index";
import { formatTxHash } from "@/shared/utils";
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
import { useWallet } from "@/shared/hooks/useWallet";
import { useLoading } from "@/shared/hooks/useLoading";
import {
  fetchTokenPairList,
  fetchApproveCallData,
  fetchSwapPayload,
} from "@/api/swap";
import { getAccessToken } from "@/api/auth";
import useTokenManagement from "@/shared/hooks/useTokenManagement";
import { getTokenBalance } from "@/shared/hooks/useNetwork";
import styles from "./index.module.css";

const { Title, Text } = Typography;

const SwapView = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [tokenInBalance, setTokenInBalance] = useState<string>("0");
  const [tokenOutBalance, setTokenOutBalance] = useState<string>("0");
  const [amountIn, setAmountIn] = useState("1");
  const [txHash, setTxHash] = useState("");
  const [useDestinationAddress, setUseDestinationAddress] = useState(false);
  const [destinationAddress, setDestinationAddress] = useState("");
  const [swapRout, setSwapRout] = useState("");
  const [explorerUrl, setExplorerUrl] = useState("");
  const { provider, signer, connect, userAddress } = useWallet();
  const [tokens, { setInToken, setOutToken, updateTokenList }] =
    useTokenManagement(tokenList);
  const [loading, { setApproveLoading, setSwapLoading }] = useLoading({
    approve: false,
    swap: false,
  });

  useEffect(() => {
    updateTokenBalance();
  }, [tokens.in, tokens.out]);

  useEffect(() => {
    if (!provider || !signer) return;
    updateTokenBalance();
    const fetchTokenData = async () => {
      try {
        const data = await fetchTokenPairList();
        if (data && data.swap_route) {
          setSwapRout(data.swap_route);
          setExplorerUrl(data.explorer_url);
          updateTokenList(data.tokenpairs);
        }
      } catch (error) {
        message.error("Request tokenpair list failed!");
      }
    };
    fetchTokenData();
  }, [signer, userAddress]);

  const connectWallet = async () => {
    try {
      await connect();
      updateTokenBalance();
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    getAccessToken();
  }, []);

  const handleError = (error: Error) => {
    console.error(error);
    const msg = error.message.includes("ACTION_REJECTED")
      ? "Transaction cancelled"
      : error.message;
    messageApi.error(msg);
  };

  const updateTokenBalance = async () => {
    try {
      if (!provider || !signer) return;
      const [balanceIn, balanceOut] = await fetchAllBalances();
      setTokenInBalance(balanceIn || "0");
      setTokenOutBalance(balanceOut || "0");
      verifySwapPair();
    } catch (error) {
      handleBalanceError(error);
    }
  };

  const fetchAllBalances = async () => {
    const requests = [
      { address: tokens.in.address, decimals: tokens.in.decimals },
      { address: tokens.out.address, decimals: tokens.out.decimals },
    ].map(async ({ address, decimals }) => {
      return getTokenBalance(
        address,
        decimals,
        userAddress ?? "",
        provider as BrowserProvider
      );
    });

    return Promise.all(requests);
  };

  const handleBalanceError = (error) => {
    setTokenInBalance("0");
    setTokenOutBalance("0");
    console.error("Balance Error:", error);

    if (error.message.includes("Network")) {
      messageApi.error("Please connect to Sepolia network");
    } else {
      messageApi.error("Failed to fetch balances");
    }
  };

  const handleApprove = async () => {
    if (!provider || !signer) return;

    try {
      if (!amountIn || amountIn == "0") {
        messageApi.warning("Approve amount cannot be 0");
        return;
      }

      const requiredAmount = ethers.parseUnits(amountIn, tokens.in.decimals);
      const isApproved = await checkAllowance(requiredAmount);
      if (isApproved) {
        messageApi.warning("Sufficient approved amount already exists");
        return;
      }

      setApproveLoading(true);
      const calldata = await fetchApproveCallData({
        tokenAddress: tokens.in.address,
        spender: swapRout,
        amount: amountIn,
        owner: userAddress ?? "",
      });

      const tx = await signer.sendTransaction(calldata);
      await tx.wait();
      setTxHash(tx.hash);
      messageApi.success("Approve successful!");
    } catch (error) {
      handleError(error);
    } finally {
      setApproveLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!signer || !provider) return;
    if (!verifySwapPair()) return;
    if (!amountIn || amountIn == "0") {
      messageApi.warning("Swap amount cannot be 0");
      return;
    }
    const requiredAmount = ethers.parseUnits(amountIn, tokens.in.decimals);
    const balanceAmount = ethers.parseUnits(
      tokenInBalance.toString(),
      tokens.in.decimals
    );
    const isApproved = await checkAllowance(requiredAmount);
    if (!isApproved) {
      messageApi.warning(`Insufficient approve amount!`);
      return;
    }

    if (balanceAmount < requiredAmount) {
      messageApi.warning("Insufficient balance");
      return;
    }

    try {
      setSwapLoading(true);
      const payload = await fetchSwapPayload({
        userAddress: userAddress ?? "",
        tokenIn: tokens.in.address,
        tokenOut: tokens.out.address,
        swapAmount: amountIn,
        swapContract: swapRout,
        useDestinationAddress: useDestinationAddress,
        destinationAddress: useDestinationAddress ? destinationAddress : "",
      });
      const tx = await signer.sendTransaction(payload);
      await tx.wait();
      setTxHash(tx.hash);
      updateTokenBalance();
      messageApi.success("Swap successful!");
    } catch (error) {
      handleError(error);
    } finally {
      setSwapLoading(false);
    }
  };

  const verifySwapPair = () => {
    if (tokens.in.address == tokens.out.address) {
      messageApi.warning("Pair not supported. Select another");
      return false;
    }

    if (tokens.in.symbol == "USDT" && tokens.out.symbol == "USDC") {
      messageApi.warning("Pair not supported. Select another");
      return false;
    }

    if (tokens.in.symbol == "USDC" && tokens.out.symbol == "USDT") {
      messageApi.warning("Pair not supported. Select another");
      return false;
    }

    return true;
  };

  const checkAllowance = useCallback(
    async (requiredAmount: bigint) => {
      if (!provider || !signer || !swapRout) {
        console.warn("Missing essential dependencies");
        return false;
      }
      try {
        const owner = await signer.getAddress();
        const tokenContract = new ethers.Contract(
          tokens.in.address,
          abi.ERC20_ABI,
          provider
        );
        const allowance = await tokenContract.allowance(owner, swapRout);
        console.debug(
          `Current allowance: ${allowance.toString()}, Required: ${requiredAmount.toString()}`
        );

        return allowance >= requiredAmount;
      } catch (error) {
        handleError(error);
        return false;
      }
    },
    [provider, signer, tokens.in.address, swapRout]
  );
  return (
    <div
      style={{
        display: "flex", 
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {contextHolder}
      <Card
        id="swap-view"
        style={{
          background: "#141414",
          borderRadius: 16,
          border: "1px solid #303030",
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div style={{ textAlign: "center", marginTop: -30, width: "100%" }}>
            <Title level={2} style={{ color: "#fff", marginBottom: 8 }}>
              {tokens.in.symbol} <SwapOutlined /> {tokens.out.symbol}
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
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Card style={{ background: "#1f1f1f", border: "none" }}>
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
                    Balance: {tokenInBalance + " " + tokens.in.symbol}
                  </Text>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Input
                    type="number"
                    value={amountIn}
                    onChange={(e) => setAmountIn(e.target.value)}
                    placeholder="0"
                    disabled={loading.approve || loading.swap}
                    style={{
                      background: "#fff",
                      border: "none",
                      fontSize: 24,
                      color: "gray",
                    }}
                  />
                  <Select
                    value={tokens.in.symbol}
                    onChange={(value) => {
                      const newToken = tokens.list.find(
                        (t) => t.symbol === value
                      );
                      if (newToken) {
                        setInToken(newToken);
                      }
                    }}
                    style={{
                      width: 160,
                      height: 46,
                      background: "#2f2f2f",
                    }}
                    dropdownStyle={{
                      background: "#2f2f2f",
                    }}
                  >
                    {tokens.list.map((token) => (
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

            <Button
              type="text"
              icon={
                <SwapOutlined
                  rotate={90}
                  style={{ fontSize: "20px", color: "#1f1f1f" }}
                />
              }
              onClick={() => {
                setInToken(tokens.out);
                setOutToken(tokens.in);
              }}
              className={styles.swapButton}
            />

            <Card
              style={{
                background: "#1f1f1f",
                border: "none",
                marginTop: "-10px",
              }}
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
                    Balance: {tokenOutBalance + " " + tokens.out.symbol}
                  </Text>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
                    value={tokens.out.symbol}
                    onChange={(value) => {
                      const newToken = tokens.list.find(
                        (t) => t.symbol === value
                      );
                      if (newToken) {
                        setOutToken(newToken);
                      }
                    }}
                    style={{
                      width: 160,
                      height: 46,
                      background: "#2f2f2f",
                    }}
                    dropdownStyle={{
                      background: "#2f2f2f",
                    }}
                  >
                    {tokens.list.map((token) => (
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

            <Space direction="vertical" style={{ width: "100%" }} size="middle">
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
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={handleApprove}
                    disabled={loading.approve || loading.swap}
                    style={{
                      height: 48,
                      background: "#13c2c2",
                      borderColor: "#13c2c2",
                    }}
                  >
                    {loading.approve ? <Spin /> : "Approve " + tokens.in.symbol}
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={handleSwap}
                    disabled={loading.approve || loading.swap}
                    style={{
                      height: 48,
                      marginTop: 10,
                      background: "#13c2c2",
                      borderColor: "#13c2c2",
                    }}
                  >
                    {loading.swap ? (
                      <Spin />
                    ) : (
                      "Swap " + tokens.in.symbol + "→" + tokens.out.symbol
                    )}
                  </Button>
                </div>
              )}
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
        </Space>
      </Card>
    </div>
  );
};

export default SwapView;

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, Space } from "antd";
import { BrowserProvider } from "ethers";
import { tokenList } from "@/contracts/index";
import HoldView from "./components/hold-view";
import ClaimView from "./components/claim-view";
import { useWallet } from "@/shared/hooks/useWallet";
import { getTokenBalance } from "@/shared/hooks/useNetwork";
import useTokenManagement from "@/shared/hooks/useTokenManagement";

export default function Earn() {
  const [wusdAmount, setWusdAmount] = useState("0");
  const [activeTab, setActiveTab] = useState("hold");
  const { userAddress, provider } = useWallet();
  const [tokens] = useTokenManagement(tokenList);
  useEffect(() => {
    if (!provider) return;
    getTokenBalance(
      tokens.in.address,
      tokens.in.decimals,
      userAddress ?? "",
      provider as BrowserProvider
    ).then((balance) => {
      setWusdAmount(balance.toString());
    });
  }, [provider, userAddress]);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 40,
          }}
        >
          <Card
            style={{
              width: 579,
              maxWidth: "91vw",
              background: "#141414",
              borderRadius: 16,
              border: "1px solid #303030",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <img
              style={{
                position: "absolute",
                maxWidth: "100%",
                zIndex: -1,
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              src={
                activeTab === "hold"
                  ? "/images/bg_earn_hold_card.png"
                  : "/images/bg_earn_claim_card.png"
              }
              alt="background"
            />
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <div
                  onClick={() => setActiveTab("hold")}
                  style={{
                    padding: "8px 16px",
                    cursor: "pointer",
                    color: activeTab === "hold" ? "#fff" : "#8c8c8c",
                    fontWeight: activeTab === "hold" ? 600 : 500,
                    fontSize: 18,
                    borderBottom:
                      activeTab === "hold" ? "2px solid #13c2c2" : "none",
                  }}
                >
                  Hold
                </div>
                <div
                  onClick={() => setActiveTab("claim")}
                  style={{
                    padding: "8px 16px",
                    cursor: "pointer",
                    color: activeTab === "claim" ? "#fff" : "#8c8c8c",
                    fontWeight: activeTab === "claim" ? 600 : 500,
                    fontSize: 18,
                    borderBottom:
                      activeTab === "claim" ? "2px solid #13c2c2" : "none",
                  }}
                >
                  Claim
                </div>
              </div>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === "hold" ? (
                  <HoldView
                    userAddress={userAddress ?? ""}
                    wusdAmount={wusdAmount}
                  />
                ) : (
                  <ClaimView />
                )}
              </motion.div>
            </Space>
          </Card>
        </div>
      </div>
    </div>
  );
}

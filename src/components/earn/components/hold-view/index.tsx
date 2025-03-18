import CountUp from "react-countup";
import { Button, Typography, Space, Card } from "antd";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@/shared/hooks/useWallet";
import WalletAddressView from "../walletaddress-view";

const { Text } = Typography;

type Props = {
  userAddress: string | undefined;
  wusdAmount: string | undefined;
};

export default function HoldView({ userAddress, wusdAmount }: Props) {
  const navigate = useNavigate();
  const { connect } = useWallet();

  const handleConnectWallet = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <Card style={{ background: "#1f1f1f", border: "none" }}>
        <Space direction="vertical" style={{ width: "100%" }} size="small">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src="/images/WUSD.png"
                alt="WUSD"
                width={42}
                height={42}
                style={{ marginTop: 15 }}
              />
              <div style={{ textAlign: "left", marginLeft: 32 }}>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: "bold",
                    color: "#fff",
                  }}
                >
                  <CountUp
                    separator=","
                    end={parseFloat(wusdAmount ?? "0")}
                    start={0}
                  />
                </div>
                <Text style={{ color: "#8c8c8c" }}>
                  WUSD are accruing interest
                </Text>
              </div>
            </div>
            <div style={{ textAlign: "left", marginLeft: 32 }}>
              <div
                style={{ fontSize: 30, fontWeight: "bold", color: "#13c2c2" }}
              >
                5%
              </div>
              <Text style={{ color: "#13c2c2" }}>Current APY</Text>
            </div>
          </div>
        </Space>
      </Card>

      <WalletAddressView userAddress={userAddress} />

      {!userAddress && (
        <Button
          type="primary"
          size="large"
          block
          onClick={handleConnectWallet}
          style={{
            height: 48,
            background: "#13c2c2",
            borderColor: "#13c2c2",
            marginTop: 16,
          }}
        >
          Connect Wallet
        </Button>
      )}

      {userAddress && parseFloat(wusdAmount ?? "0") <= 0 && (
        <div style={{ width: "100%", marginTop: 16 }}>
          <Text
            style={{
              display: "block",
              textAlign: "left",
              marginBottom: 16,
              color: "#fff",
            }}
          >
            Get WUSD now with Stableflow
          </Text>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <div>
              <Button
                type="primary"
                size="large"
                block
                onClick={() => {
                  navigate("/swap");
                }}
                style={{
                  height: 48,
                  background: "#13c2c2",
                  borderColor: "#13c2c2",
                }}
              >
                Go to Swap
              </Button>
              <Text
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "#8c8c8c",
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                Convert your USDT/USDC to WUSD
              </Text>
            </div>
            <div>
              <Button
                type="primary"
                size="large"
                block
                style={{
                  height: 48,
                  background: "#13c2c2",
                  borderColor: "#13c2c2",
                }}
              >
                Go to Bridge
              </Button>
              <Text
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "#8c8c8c",
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                Bridge your USDT on Tron to WUSD on ETH
              </Text>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

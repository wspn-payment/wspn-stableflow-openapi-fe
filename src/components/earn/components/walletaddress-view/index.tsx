import { Typography } from "antd";
import { WalletOutlined } from "@ant-design/icons";

const { Text } = Typography;

type Props = {
  userAddress: string | undefined;
};

export default function WalletAddressView({ userAddress }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        background: "#1f1f1f",
        borderRadius: 8,
        marginTop: 16,
        marginBottom: 16,
        border: "1px solid #303030",
      }}
    >
      <WalletOutlined style={{ color: "#8c8c8c", marginRight: 8 }}/>
      <Text style={{ color: "#8c8c8c", marginRight: 8 }}>Wallet Address :</Text>
      <Text
        style={{
          color: "#8c8c8c",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {userAddress ? userAddress : "Not connected"}
      </Text>
    </div>
  );
}

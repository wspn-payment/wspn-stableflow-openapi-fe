import { FC } from "react";
import { Layout, Menu, Button, message } from "antd";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  SwapOutlined,
  LineChartOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { useWallet } from "@/shared/hooks/useWallet"; 
const { Header, Content } = Layout;

const AppLayout: FC = () => {
  const location = useLocation();
  const selectedKey = location.pathname.split("/")[1] || "swap";
  const { connect, disconnect, userAddress, isConnecting } = useWallet();
  const [messageApi, contextHolder] = message.useMessage();

  const menuItems = [
    {
      key: "swap",
      icon: <SwapOutlined />,
      label: <Link to="/swap">SWAP</Link>,
    },
    {
      key: "earn",
      icon: <LineChartOutlined />,
      label: <Link to="/earn">EARN</Link>,
    },
  ];

  const connectWallet = async () => {
    try {
      if (userAddress) {
        await disconnect();
        return;
      }
      await connect();
    } catch (error) {
      handleError(error);
    }
  };

  const handleError = (error: Error) => {
    console.error(error);
    const msg = error.message.includes("ACTION_REJECTED")
      ? "Transaction cancelled"
      : error.message;
    messageApi.error(msg);
  };

  const formatAddress = (address: string): string => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#000000" }}>
      {contextHolder}
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          background: "#141414",
          padding: "0 15px",
          borderBottom: "1px solid #303030",
        }}
      >
        <div
          style={{
            width: 120,
            height: 31,
            margin: "16px 24px 16px 0",
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            src="/favicon.png"
            alt="logo"
            style={{ height: "100%", marginRight: 8 }}
          />
          <span style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
            StableFlow
          </span>
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={menuItems}
          style={{
            flex: 1,
            minWidth: 0,
            background: "transparent",
            borderBottom: "none",
          }}
        />
        <Button
          type="primary"
          size="large" 
          icon={<WalletOutlined />}
          onClick={connectWallet}
          loading={isConnecting}
          style={{
            height: 32,
            background: userAddress ? "#1f3d5c" : "#1890ff",
            borderColor: userAddress ? "#1f3d5c" : "#1890ff",
            borderRadius: "4px",
            transition: "all 0.3s",
          }}
        >
          {userAddress ? formatAddress(userAddress) : "Connect Wallet"}
        </Button>
      </Header>
      <Content
        style={{
          padding: 24,
          minHeight: 280,
          background: "#ffffff",
        }}
      >
        <Outlet />
      </Content>
    </Layout>
  );
};

export default AppLayout;

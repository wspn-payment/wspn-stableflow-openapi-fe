import { useState } from "react";
import { Button, Typography } from "antd";
import { useWallet } from "@/shared/hooks/useWallet";
import WalletAddressView from "../walletaddress-view";

const { Text } = Typography;
const generateYears = (startYear: number, endYear: number) => {
  return Array.from({ length: endYear - startYear + 1 }, (_, i) => (startYear + i).toString());
};
const ClaimView = () => {
  const { userAddress } = useWallet();
  const date = new Date();
  const monthIndex = date.getMonth();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [selectedMonth, setSelectedMonth] = useState(months[monthIndex]);
  const currentYear = date.getFullYear();
  const years = generateYears(2024, currentYear);
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());


  // 模拟数据 - 实际应用中应从API获取
  const rewardAmount = "0.170091";
  const earningHours = "128H";

  const handleMonthlyClaimClick = () => {
    console.log("Monthly claim clicked");
    // 实际应用中应调用索赔API
  };

  const handleMultipleClaimClick = () => {
    console.log("Multiple claim clicked");
    // 实际应用中应打开多重索赔模态框
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div style={{ fontSize: 48, fontWeight: "bold", color: "#13c2c2" }}>
          {rewardAmount}
        </div>
        <Text style={{ color: "#8c8c8c" }}>You have earned so far</Text>
      </div>

      <WalletAddressView userAddress={userAddress ?? ""} />

      <div style={{ marginBottom: "24px" }}>
        <div style={{ marginBottom: "16px" }}>
          <Text style={{ color: "#8c8c8c" }}>Rewards Earned</Text>
        </div>
        <div className="flex items-center mt-2">
          <select
              className="bg-transparent text-white cursor-pointer p-1"
              onChange={(e) => setSelectedYear(e.target.value)}
              value={selectedYear}
          >
              {years.map((year) => (
                  <option key={year} value={year} className="bg-[#1A2527] text-black">
                      Year: {year}
                  </option>
              ))}
          </select>
        </div>
        <div
          style={{
            display: "flex",
            overflowX: "auto",
            gap: "8px",
            padding: "8px 0",
            marginBottom: "24px",
            background: "#1f1f1f",
            borderRadius: "8px",
          }}
        >
          {months.map((month) => (
            <div
              key={month}
              onClick={() => setSelectedMonth(month)}
              style={{
                padding: "8px 16px",
                cursor: "pointer",
                borderRadius: "4px",
                background: selectedMonth === month ? "#006d75" : "transparent",
                color: selectedMonth === month ? "#fff" : "#8c8c8c",
                fontWeight: selectedMonth === month ? 600 : 400,
              }}
            >
              {month}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <div>
          <Text style={{ color: "#8c8c8c" }}>Monthly Rewards</Text>
          <div style={{ fontSize: 24, fontWeight: "bold", color: "#13c2c2" }}>
            ${rewardAmount}
          </div>
        </div>
        <div>
          <Text style={{ color: "#8c8c8c" }}>Earning Hours</Text>
          <div
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: "#fff",
              textAlign: "right",
            }}
          >
            {earningHours}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "16px" }}>
        <Button
          type="primary"
          size="large"
          onClick={handleMonthlyClaimClick}
          style={{
            flex: 1,
            height: 48,
            background: "linear-gradient(90deg, #1890ff 0%, #13c2c2 100%)",
            borderColor: "transparent",
          }}
        >
          Monthly Claim
        </Button>
        <Button
          type="primary"
          size="large"
          onClick={handleMultipleClaimClick}
          style={{
            flex: 1,
            height: 48,
            background: "linear-gradient(90deg, #1890ff 0%, #13c2c2 100%)",
            borderColor: "transparent",
          }}
        >
          Multiple claim
        </Button>
      </div>
    </div>
  );
};

export default ClaimView;

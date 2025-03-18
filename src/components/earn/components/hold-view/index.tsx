import CountUp from "react-countup";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@/shared/hooks/useWallet"; 
import WalletAddressView from "../walletaddress-view";

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

  const handleGoToSwap = () => {
    navigate("/swap");
  };

  const handleGoToBridge = () => {
    // Bridge functionality would go here
    console.log("Bridge functionality not implemented yet");
  };
  
  return (
    <div className="w-full flex-col flex items-center justify-center mt-4">
      <div className="flex w-full items-center">
        <div className="flex items-center ml-2">
          <img src="/images/WUSD.png" alt="WUSD" width={42} height={42} />
        </div>
        <div className="flex flex-col ml-10">
          <div className="text-[32px] font-bold flex">
            <CountUp
              separator=","
              end={parseFloat(wusdAmount ?? "0")}
              start={0}
            />
          </div>
          <div className="text-gray-400 text-sm mb-4 ml-1">
            WUSD are accruing interest
          </div>
        </div>
        <div className="flex flex-col mb-4 ml-10">
          <div className="text-emerald-400 text-[30px] font-bold">+5%</div>
          <div className="flex flex-row justify-center items-center">
            <div className="text-emerald-400 ml-1 truncate overflow-hidden whitespace-nowrap">
              Current APY
            </div>
          </div>
        </div>
      </div>
      <WalletAddressView userAddress={userAddress} />
      {!userAddress && (
        <div className="text-center w-full my-4 iphone:my-3">
          <Button 
            onClick={handleConnectWallet}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-emerald-400 text-white rounded-xl font-bold normal-case"
          >
            Connect Wallet
          </Button>
        </div>
      )}

      {userAddress && parseFloat(wusdAmount ?? "0") <= 0 && (
        <div className="w-full mt-4">
          <div className="text-left mb-4">Get WUSD now with Stableflow</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <Button 
                onClick={handleGoToSwap}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-emerald-400 text-white rounded-xl font-bold normal-case"
              >
                Go to Swap
              </Button>
              <div className="text-gray-400 text-[10px] mt-2 text-center">
                Convert your USDT/USDC to WUSD
              </div>
            </div>
            <div className="flex flex-col">
              <Button 
                onClick={handleGoToBridge}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-emerald-400 text-white rounded-xl font-bold normal-case"
              >
                Go to Bridge
              </Button>
              <div className="text-gray-400 text-[10px] mt-2 text-center">
                Bridge your USDT on Tron to WUSD on ETH
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

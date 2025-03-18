import { motion } from "framer-motion";
import { useEffect, useState } from "react";
// import { contractInfo } from '@/contracts';
import HoldView from "./components/hold-view";
import ClaimView from "./components/claim-view";
import { useWallet } from "@/shared/hooks/useWallet";
// import useGetBalances from '@/shared/hooks/useGetBalances';

export default function Earn() {
  const wusdAmount = "0";
  const [activeTab, setActiveTab] = useState("hold");
  const [cardHeight, setCardHeight] = useState(400);
  const { userAddress } = useWallet();
  // const { WUSD_TOKEN } = contractInfo;
  // const { wusdAmount } = useGetBalances({
  //     tokenIn: WUSD_TOKEN,
  //     tokenOut: WUSD_TOKEN,
  //     type: 'earn',
  // });
  useEffect(() => {
    if (activeTab === "hold") {
      if (userAddress) {
        if (parseFloat(wusdAmount || "0") > 0) {
          setCardHeight(280);
        } else {
          setCardHeight(400);
        }
      } else {
        setCardHeight(350);
      }
    } else {
      setCardHeight(500);
    }
  }, [activeTab, wusdAmount, userAddress]);
  return (
    <div className="flex flex-col flex-1">
      <div className="w-full flex-1 flex flex-col">
        <div className="flex flex-col items-center gap-4 mobile:gap-0 pt-12 mobile:pt-5 max_tablet:pb-10 max_tablet:pt-5">
          <div className="flex flex-col items-center gap-1 max-w-[91vw]">
            <div className="text-[53px] mobile:text-[40px] font-bold text-white whitespace-nowrap leading-tight">
              Hold{" "}
              <span className="text-emerald-400 leading-[52px]">
                &quot;WUSD&quot;
              </span>{" "}
              to Earn
            </div>
            <div className="text-[18px] text-gray-300 text-center whitespace-nowrap">
              Retain Full Ownership of Your liquidity While Earning Freely
            </div>
          </div>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.5 }}
          variants={{
            hidden: { opacity: 0, x: -100 },
            visible: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: 100 },
          }}
          className="w-full flex-1 flex items-center justify-center mt-10"
        >
          <div className="w-[579px] mobile:w-[343px] relative m-auto text-white max-w-[91vw] bg-no-repeat bg-contain bg-center rounded-2xl shadow-lg border border-[#26D3A6]/20" style={{ background: "linear-gradient(180deg, #001529 0%, #000000 100%)" }}>
            <img
              className="absolute max-w-full z-[-1]"
              src={
                activeTab === "hold"
                  ? "/images/bg_earn_hold_card.png"
                  : "/images/bg_earn_claim_card.png"
              }
              alt="modal"
              width={579}
              height={cardHeight}
            />
            <div className="flex flex-col justify-center p-4 iphone:px-3 iphone:py-4">
              <div className="flex gap-4 mb-4">
                <div
                  onClick={() => setActiveTab("hold")}
                  className={`component-text-title-2-emphasized iphone:text-[20px] p-2 cursor-pointer ${
                    activeTab === "hold"
                      ? "border-b-2 border-solid border-emerald-400 font-bold text-white"
                      : "text-gray-400 hover:text-white transition-colors duration-200"
                  }`}
                >
                  Hold
                </div>
                <div
                  onClick={() => setActiveTab("claim")}
                  className={`component-text-title-2-emphasized iphone:text-[20px] p-2 cursor-pointer ${
                    activeTab === "claim"
                      ? "border-b-2 border-solid border-emerald-400 font-bold text-white"
                      : "text-gray-400 hover:text-white transition-colors duration-200"
                  }`}
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
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

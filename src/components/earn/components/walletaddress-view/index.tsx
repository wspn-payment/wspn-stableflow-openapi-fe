type Props = {
  userAddress: string | undefined;
};

export default function WalletAddressView({ userAddress }: Props) {
  return (
    <div className="flex justify-between w-full items-center py-2 px-[25px] gap-2 h-[40px] bg-[#1A2527] backdrop-blur-[10px] rounded-xl mx-auto mt-4 mb-4 border border-solid border-[1px] border-[#26D3A6]">
      <div className="text-gray-400 text-sm truncate overflow-hidden whitespace-nowrap">
        Wallet Address :
      </div>
      <div className="text-gray-400 text-[13px] max-w-[80%] flex-1 truncate overflow-hidden whitespace-nowrap">
        {userAddress ?? "Not connected"}
      </div>
    </div>
  );
}

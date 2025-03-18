// import { softStakingContract } from '@/contracts';
// import { cn } from '@/shared/utils';
// import { getMonthlyRewards } from '@/services/monthly-reward';
import { Button } from "antd";
import { useQuery } from '@tanstack/react-query';
// import { NotificationType } from '@/types/notification';
import { prepareContractCall } from 'thirdweb';
// import { signWallet } from '@/shared/utils/sign-wallet-signature';
// import { useGlobalStore } from '@/shared/store';
import { useActiveAccount, useSendTransaction, useSwitchActiveWalletChain, useActiveWalletChain } from 'thirdweb/react';
import { useState, useMemo } from 'react';
import WalletAddressView from '../walletaddress-view';

const ClaimView = () => {
    const date = new Date();
    const monthIndex = date.getMonth();
    const { setNotifyInfo, notifyInfo, chain, userInfo, setDataAccessKey, dataAccessKey } = useGlobalStore();
    const { mutate: sendTx } = useSendTransaction({ payModal: false });
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const [selectedMonth, setSelectedMonth] = useState(months[monthIndex]);
    const account = useActiveAccount();
    const activeChain = useActiveWalletChain();
    const switchChain = useSwitchActiveWalletChain();

    const formatReward = (reward: number) => {
        return reward.toFixed(6);
    };

    const handleOpenSelectMultipleClaim = () => {
        setNotifyInfo({
            open: true,
            data: {
                dataClaim: monthlyRewards,
                onConfirm: (dataClaim: any[]) => {
                    handleConfirmMultipleClaim(dataClaim);
                },
            },
            type: NotificationType.SELECT_MONTH_REWARD,
            title: 'Multiple claim',
        });
    };
    const handleConfirmMultipleClaim = (dataClaim: any[]) => {
        setNotifyInfo({
            open: true,
            data: {
                dataClaim: dataClaim,
                onConfirm: (dataAccessKey: string[]) => {
                    callClaimsMethod(dataAccessKey);
                },
            },
            type: NotificationType.REWARD_DETAIL,
            title: 'Claim',
        });
    };
    const callClaimsMethod = async (accessKeys: string[]) => {
        const token = localStorage.getItem('token');
        if (!token) {
            await signWallet(account, activeChain?.id?.toString(), undefined, () => {
                setNotifyInfo({
                    open: true,
                    type: NotificationType.WARNING_GLOBAL,
                    data: {
                        title: 'Connection Timed Out',
                        message: 'The wallet connection process has expired. Please try reconnecting your wallet to proceed!',
                        titleBtn: 'OK',
                    },
                });
            });
        }
        const handleSwitchChain = async () => {
            let isSwitchSuccess = true;
            try {
                await switchChain(chain);
            } catch (error: any) {
                isSwitchSuccess = false;
                setNotifyInfo(null);
                setDataAccessKey([]);
                let message = error?.message || '';
                if (message.indexOf('An error occurred when attempting to switch chain') !== -1) {
                    message = `Chain is mismatched. Please make sure your wallet is switched to expected chain`;
                    return setNotifyInfo({
                        open: true,
                        type: NotificationType.SOMETHING_WRONG,
                        data: { message, titleBtn: 'Back to dashboard' },
                    });
                }
                setNotifyInfo({
                    open: true,
                    type: NotificationType.SOMETHING_WRONG,
                    data: { message, titleBtn: 'Back to dashboard' },
                });
            }
            return isSwitchSuccess;
        };
        const isSwitchSuccess = await handleSwitchChain();
        if (!isSwitchSuccess) return;
        const claimTran = prepareContractCall({
            contract: softStakingContract(chain),
            method: 'claims',
            params: [accessKeys],
        });
        sendTx(claimTran, {
            onError: (error: any) => {
                setDataAccessKey([]);
                // Unknown reason: the transaction was expired. Don't show expired error in the modal.
                // 4001 : user click "cancel" on interface
                if ([4001, 5000].some((code) => code === error?.code)) {
                    setNotifyInfo({ open: true, type: NotificationType.REJECT_REWARD });
                }
            },
        });
    };
    const { data: monthlyRewardList } = useQuery({
        queryKey: ['monthly-reward-list', userInfo, chain, account, notifyInfo, dataAccessKey],
        queryFn: () => {
            const data = getMonthlyRewards(chain?.id || 0);
            return data;
        },
        // refetchInterval: 1000*3,
        enabled: !!userInfo && !!chain && !!account,
    });

    const monthlyRewards = useMemo(() => {
        return (monthlyRewardList || []).map((reward: any, index: number) => ({
            ...reward,
            index: index,
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [monthlyRewardList, userInfo, chain, account]);
    const rewardTotal = monthlyRewards?.reduce((acc: any, reward: any) => acc + reward?.amountReward, 0) || 0;
    const rewardNum = formatReward(rewardTotal) ?? '0';

    const selectedMonthRewards = useMemo(() => {
        if (!monthlyRewards) return [];
        return monthlyRewards.filter((reward) => {
            const monthIndex = reward.month - 1;
            return months[monthIndex] === selectedMonth;
        });
    }, [monthlyRewards, selectedMonth, months]);

    const earningHours = useMemo(() => {
        return selectedMonthRewards.reduce((total, reward) => total + (reward.earningHours || 0), 0);
    }, [selectedMonthRewards]);

    const selectedMonthTotalReward = useMemo(() => {
        if (selectedMonthRewards.length === 0) return '0.00';
        return selectedMonthRewards.reduce((total, reward) => total + Number(reward.amountReward), 0).toFixed(6);
    }, [selectedMonthRewards]);

    const handleMonthlyClaim = () => {
        if (selectedMonthRewards.length === 0) return;

        // 从选中的奖励中获取 access_key 数组
        const claimData = selectedMonthRewards
            .map((reward) => ({
                ...reward,
                access_key: reward.claimDataCreated?.access_key,
            }))
            .filter((reward) => reward.claimDataCreated?.status === 0);

        setNotifyInfo({
            open: true,
            data: {
                dataClaim: claimData,
                onConfirm: (dataAccessKey: string[]) => {
                    callClaimsMethod(dataAccessKey);
                },
            },
            type: NotificationType.REWARD_DETAIL,
            title: 'Claim',
        });
    };
    const hasClaimableMonthlyRewards = useMemo(() => {
        return selectedMonthRewards.some((reward) => reward?.claimDataCreated?.status === 0 && reward?.pushed_at !== null);
    }, [selectedMonthRewards]);
    return (
        <div className="w-full flex-col flex items-center justify-center mt-4">
            <div className="flex w-full items-center justify-left gap-10">
                <div className="flex items-center ml-2">
                    <img src="/images/WUSD.png" alt="WUSD" width={42} height={42} />
                </div>
                <div className="flex flex-col items-left">
                    {/* <div className="text-[32px] font-bold">81,596.41</div> */}
                    <div className="text-emerald-400 text-[30px] font-bold">{rewardNum}</div>
                    <div className="text-gray-400 text-sm mb-4 ml-1">You have earned so far</div>
                </div>
            </div>
            <WalletAddressView account={account} />
            <div className="w-full mt-4">
                <p className="text-white text-sm mb-2">Rewards Earned</p>
                <div className="flex flex-nowrap justify-center items-center bg-[#1A2527] rounded-full p-2">
                    {months.map((month) => (
                        <div
                            key={month}
                            className={`cursor-pointer px-1.5 py-1 rounded-full ${selectedMonth === month ? 'bg-white text-black' : 'text-gray-400'}`}
                            onClick={() => setSelectedMonth(month)}
                        >
                            {month}
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex justify-center items-center w-full mt-4 gap-40">
                <div className="flex flex-col items-center">
                    <div className="text-white text-sm">Monthly Rewards</div>
                    <div className="text-emerald-400 text-[24px] font-bold">${selectedMonthTotalReward}</div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="text-white text-sm">Earning Hours</div>
                    <div className="text-emerald-400 text-[24px] font-bold">{earningHours}H</div>
                </div>
            </div>
            <div className="text-center w-full my-4 iphone:my-3">
                <div className="flex justify-between gap-4">
                    <Button
                        className={cn('w-full py-3 bg-gradient-to-r from-blue-500 to-emerald-400 text-white rounded-xl font-bold normal-case', {
                            'opacity-50 cursor-not-allowed': !hasClaimableMonthlyRewards,
                        })}
                        onClick={handleMonthlyClaim}
                        disabled={!hasClaimableMonthlyRewards}
                    >
                        Monthly Claim
                    </Button>
                    <Button
                        className={cn('w-full py-3 bg-gradient-to-r from-blue-500 to-emerald-400 text-white rounded-xl font-bold normal-case', {
                            'opacity-50 cursor-not-allowed': monthlyRewards.filter((row) => row?.claimDataCreated?.status === 0).length === 0,
                        })}
                        onClick={handleOpenSelectMultipleClaim}
                        disabled={!monthlyRewards.some((row) => row?.claimDataCreated?.status === 0)}
                    >
                        Multiple claim
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ClaimView;

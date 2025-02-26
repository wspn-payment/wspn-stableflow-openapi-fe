/**
 * 格式化交易哈希，保留前6位和后4位，中间用...替代
 * @param hash 完整的交易哈希
 * @returns 格式化后的交易哈希
 */
export const formatTxHash = (hash: string): string => {
  if (!hash || hash.length < 10) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
};
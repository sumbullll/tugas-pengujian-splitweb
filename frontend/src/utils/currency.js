export const formatIDR = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

export const idrToEth = async (idrAmount) => {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=idr');
    const data = await res.json();
    const rate = data.ethereum.idr;
    return (idrAmount / rate).toFixed(6);
  } catch (error) {
    return "0.0000";
  }
};
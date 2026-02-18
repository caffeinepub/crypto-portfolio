const COINGECKO_API = 'https://api.coingecko.com/api/v3';

const ASSET_ID_MAP: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'ADA': 'cardano',
  'DOT': 'polkadot',
  'MATIC': 'matic-network',
  'AVAX': 'avalanche-2',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'ATOM': 'cosmos',
  'XRP': 'ripple',
  'DOGE': 'dogecoin',
  'LTC': 'litecoin',
  'BCH': 'bitcoin-cash',
  'XLM': 'stellar',
  'ALGO': 'algorand',
  'VET': 'vechain',
  'ICP': 'internet-computer',
  'FIL': 'filecoin',
  'NEAR': 'near',
};

function normalizeAssetSymbol(asset: string): string {
  return asset.toUpperCase().trim();
}

function getCoingeckoId(asset: string): string {
  const normalized = normalizeAssetSymbol(asset);
  return ASSET_ID_MAP[normalized] || asset.toLowerCase();
}

export async function fetchPrices(assets: string[]): Promise<Record<string, number>> {
  if (assets.length === 0) return {};

  const uniqueAssets = [...new Set(assets.map(normalizeAssetSymbol))];
  const coingeckoIds = uniqueAssets.map(getCoingeckoId).join(',');

  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${coingeckoIds}&vs_currencies=usd`
    );

    if (!response.ok) {
      throw new Error(`Price API returned ${response.status}`);
    }

    const data = await response.json();
    
    const prices: Record<string, number> = {};
    uniqueAssets.forEach(asset => {
      const id = getCoingeckoId(asset);
      if (data[id]?.usd) {
        prices[asset] = data[id].usd;
      }
    });

    return prices;
  } catch (error) {
    console.error('Failed to fetch prices:', error);
    throw new Error('Unable to fetch live prices. Please try again later.');
  }
}

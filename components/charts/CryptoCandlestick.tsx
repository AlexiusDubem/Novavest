'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface CandleData {
  time: string
  open: number
  high: number
  low: number
  close: number
}

interface CryptoInfo {
  symbol: string
  name: string
  price: number
  change24h: number
  changePercent: number
}

const CandleStick = ({ data }: { data: CandleData }) => {
  const width = 30
  const height = 200
  const padding = 10

  // Assuming price range 20000-50000 for BTC, 1000-4000 for ETH in SVG
  const minPrice = 0
  const maxPrice = 100

  const yScale = (price: number) =>
    height - ((price - minPrice) / (maxPrice - minPrice)) * height

  const wickX = padding + width / 2
  const bodyWidth = 12
  const bodyX = padding + width / 2 - bodyWidth / 2

  const highY = yScale(data.high)
  const lowY = yScale(data.low)
  const openY = yScale(data.open)
  const closeY = yScale(data.close)

  const isGreen = data.close >= data.open
  const bodyTop = Math.min(openY, closeY)
  const bodyHeight = Math.abs(closeY - openY) || 2

  const color = isGreen ? '#14B8A6' : '#EF4444'

  return (
    <g key={data.time}>
      {/* Wick */}
      <line
        x1={wickX}
        y1={highY}
        x2={wickX}
        y2={lowY}
        stroke={color}
        strokeWidth="1"
      />
      {/* Body */}
      <rect
        x={bodyX}
        y={bodyTop}
        width={bodyWidth}
        height={bodyHeight}
        fill={color}
        stroke={color}
        strokeWidth="1"
      />
    </g>
  )
}

export function CryptoCandlestick() {
  const [btcData, setBtcData] = useState<CandleData[]>([])
  const [ethData, setEthData] = useState<CandleData[]>([])
  const [btcInfo, setBtcInfo] = useState<CryptoInfo | null>(null)
  const [ethInfo, setEthInfo] = useState<CryptoInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        setLoading(true)

        // Fetch BTC prices
        const btcRes = await fetch(
          'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30'
        )
        const btcData = await btcRes.json()

        // Fetch ETH prices
        const ethRes = await fetch(
          'https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=30'
        )
        const ethData = await ethRes.json()

        // Fetch current info
        const infoRes = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'
        )
        const infoData = await infoRes.json()

        // Transform BTC candles
        const btcCandles = transformToCandles(btcData.prices)
        setBtcData(btcCandles)

        // Transform ETH candles
        const ethCandles = transformToCandles(ethData.prices)
        setEthData(ethCandles)

        // Set info
        setBtcInfo({
          symbol: 'BTC',
          name: 'Bitcoin',
          price: infoData.bitcoin.usd,
          change24h: infoData.bitcoin.usd_24h_change,
          changePercent: infoData.bitcoin.usd_24h_change,
        })

        setEthInfo({
          symbol: 'ETH',
          name: 'Ethereum',
          price: infoData.ethereum.usd,
          change24h: infoData.ethereum.usd_24h_change,
          changePercent: infoData.ethereum.usd_24h_change,
        })

        setError(null)
      } catch (err) {
        console.error('Error fetching crypto data:', err)
        setError('Failed to load crypto data')
        // Fallback mock data
        setBtcData(generateMockCandles())
        setEthData(generateMockCandles())
        setBtcInfo({
          symbol: 'BTC',
          name: 'Bitcoin',
          price: 42500,
          change24h: 2.5,
          changePercent: 2.5,
        })
        setEthInfo({
          symbol: 'ETH',
          name: 'Ethereum',
          price: 2250,
          change24h: 1.8,
          changePercent: 1.8,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCryptoData()
    const interval = setInterval(fetchCryptoData, 5 * 60 * 1000) // Refresh every 5 minutes
    return () => clearInterval(interval)
  }, [])

  const transformToCandles = (prices: [number, number][]) => {
    const candles: CandleData[] = []
    const groupSize = Math.floor(prices.length / 15) // Group into ~15 candles

    for (let i = 0; i < prices.length; i += groupSize) {
      const group = prices.slice(i, i + groupSize)
      if (group.length === 0) continue

      const pricesInGroup = group.map((p) => p[1])
      const open = pricesInGroup[0]
      const close = pricesInGroup[pricesInGroup.length - 1]
      const high = Math.max(...pricesInGroup)
      const low = Math.min(...pricesInGroup)

      const date = new Date(group[0][0])
      const time = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })

      candles.push({ time, open, high, low, close })
    }

    return candles
  }

  const generateMockCandles = (): CandleData[] => {
    const candles: CandleData[] = []
    let basePrice = 95
    for (let i = 0; i < 15; i++) {
      const volatility = Math.random() * 4 - 2
      basePrice = Math.max(50, Math.min(100, basePrice + volatility))
      const open = basePrice
      const close = open + (Math.random() - 0.5) * 2
      const high = Math.max(open, close) + Math.random() * 2
      const low = Math.min(open, close) - Math.random() * 2

      candles.push({
        time: `Day ${i + 1}`,
        open,
        high,
        low,
        close,
      })
    }
    return candles
  }

  if (loading) {
    return (
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Crypto Charts</CardTitle>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
          <p className="text-slate-500">Loading real-time data...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Live Crypto Charts</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="btc" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="btc">Bitcoin (BTC)</TabsTrigger>
            <TabsTrigger value="eth">Ethereum (ETH)</TabsTrigger>
          </TabsList>

          <TabsContent value="btc" className="space-y-6">
            {btcInfo && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    {btcInfo.name}
                  </p>
                  <p className="text-3xl font-bold text-slate-900">
                    ${btcInfo.price.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    btcInfo.change24h >= 0
                      ? 'bg-teal-50 text-teal-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {btcInfo.change24h >= 0 ? (
                    <TrendingUp size={18} />
                  ) : (
                    <TrendingDown size={18} />
                  )}
                  <span className="font-semibold">
                    {btcInfo.change24h >= 0 ? '+' : ''}
                    {btcInfo.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <svg
                viewBox="0 0 600 250"
                className="w-full h-64 border border-slate-200 rounded-lg bg-white p-4"
              >
                {btcData.map((candle, i) => (
                  <g key={i} transform={`translate(${i * 40 + 30}, 20)`}>
                    <CandleStick data={candle} />
                    <text
                      x={15}
                      y={220}
                      fontSize="11"
                      fill="#64748b"
                      textAnchor="middle"
                    >
                      {candle.time}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </TabsContent>

          <TabsContent value="eth" className="space-y-6">
            {ethInfo && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    {ethInfo.name}
                  </p>
                  <p className="text-3xl font-bold text-slate-900">
                    ${ethInfo.price.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    ethInfo.change24h >= 0
                      ? 'bg-teal-50 text-teal-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {ethInfo.change24h >= 0 ? (
                    <TrendingUp size={18} />
                  ) : (
                    <TrendingDown size={18} />
                  )}
                  <span className="font-semibold">
                    {ethInfo.change24h >= 0 ? '+' : ''}
                    {ethInfo.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <svg
                viewBox="0 0 600 250"
                className="w-full h-64 border border-slate-200 rounded-lg bg-white p-4"
              >
                {ethData.map((candle, i) => (
                  <g key={i} transform={`translate(${i * 40 + 30}, 20)`}>
                    <CandleStick data={candle} />
                    <text
                      x={15}
                      y={220}
                      fontSize="11"
                      fill="#64748b"
                      textAnchor="middle"
                    >
                      {candle.time}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <p className="text-sm text-amber-600 mt-4">
            Note: {error} - showing mock data
          </p>
        )}
      </CardContent>
    </Card>
  )
}

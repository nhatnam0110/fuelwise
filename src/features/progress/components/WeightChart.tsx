import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useT } from '@/hooks/useT'

type Filter = '7d' | '30d' | 'all'
type ChartPoint = { date: string; weight: number; loggedAt: number }

type WeightChartProps = {
  chartData: ChartPoint[]
  filter: Filter
  onFilterChange: (f: Filter) => void
  yDomain: [number, number]
  tp: ReturnType<typeof useT>['progress']
}

export function WeightChart({ chartData, filter, onFilterChange, yDomain, tp }: WeightChartProps) {
  return (
    <section className="bg-[#0d1d10] rounded-[2rem] p-6 md:p-8 border border-[#172a1a]">
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-black text-xl text-white">{tp.trendOverview}</h3>
        <div className="flex bg-[#08160b] p-1 rounded-xl gap-1">
          {(['7d', '30d', 'all'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${
                filter === f ? 'bg-[#172a1a] text-[#4ade80]' : 'text-[#a0af9e] hover:text-white'
              }`}
            >
              {tp.filters[f]}
            </button>
          ))}
        </div>
      </div>

      {chartData.length < 2 ? (
        <div className="h-48 flex items-center justify-center text-[#a0af9e] text-sm">
          {tp.noHistory}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#172a1a" vertical={false} />
            <XAxis dataKey="date" stroke="#a0af9e" tick={{ fontSize: 10, fill: '#a0af9e' }} axisLine={false} tickLine={false} />
            <YAxis domain={yDomain} stroke="#a0af9e" tick={{ fontSize: 10, fill: '#a0af9e' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}kg`} />
            <Tooltip
              contentStyle={{ background: '#0d1d10', border: '1px solid #172a1a', borderRadius: 12, fontSize: 12 }}
              labelStyle={{ color: '#a0af9e' }}
              formatter={(v) => [`${v} kg`, '']}
            />
            <Area
              type="monotone"
              dataKey="weight"
              stroke="#4ade80"
              strokeWidth={3}
              fill="url(#wGrad)"
              dot={{ r: 4, fill: '#4ade80', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#4ade80', strokeWidth: 2, stroke: '#051107' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </section>
  )
}

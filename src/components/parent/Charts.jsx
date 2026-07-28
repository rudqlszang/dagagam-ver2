import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const AXIS = { fontSize: 11, fill: '#6B7C8D' }
const GRID = '#E6EDF3'

const tooltipStyle = {
  contentStyle: {
    borderRadius: 12,
    border: 'none',
    boxShadow: '0 8px 24px -6px rgba(43,58,74,0.25)',
    fontSize: 12,
    padding: '8px 10px',
  },
  labelStyle: { fontWeight: 700, color: '#2B3A4A', marginBottom: 2 },
}

export function WeeklyBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={170}>
      <BarChart data={data} margin={{ top: 6, right: 4, bottom: 0, left: -22 }} barGap={3}>
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="day" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={38} />
        <Tooltip cursor={{ fill: 'rgba(63,182,240,0.08)' }} {...tooltipStyle} />
        <Bar dataKey="지난주" fill="#D6E3EC" radius={[5, 5, 0, 0]} maxBarSize={13} />
        <Bar dataKey="이번주" fill="#3FB6F0" radius={[5, 5, 0, 0]} maxBarSize={13} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function GrowthRadarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={215}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke={GRID} />
        <PolarAngleAxis dataKey="metric" tick={{ ...AXIS, fontSize: 11.5 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          name="지난달"
          dataKey="지난달"
          stroke="#C7D5E0"
          fill="#C7D5E0"
          fillOpacity={0.35}
        />
        <Radar
          name="이번달"
          dataKey="이번달"
          stroke="#3FB6F0"
          fill="#3FB6F0"
          fillOpacity={0.35}
        />
        <Tooltip {...tooltipStyle} />
      </RadarChart>
    </ResponsiveContainer>
  )
}

export function PronunciationLineChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="week" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis domain={[40, 90]} tick={AXIS} axisLine={false} tickLine={false} width={38} />
        <Tooltip {...tooltipStyle} />
        <Line
          type="monotone"
          dataKey="점수"
          stroke="#FF8A7A"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#FF8A7A', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

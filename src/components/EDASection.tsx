import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface EDASectionProps {
  data: any[];
  stats: any;
}

export default function EDASection({ data, stats }: EDASectionProps) {
  if (!data || data.length === 0) return null;

  const chartData = data.map(r => ({
    date: r.Date,
    close: parseFloat(r["Adj Close"]),
    returns: parseFloat(r.Daily_Return)
  }));

  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Mean Close", value: stats?.mean?.toFixed(2) },
          { label: "Variance", value: stats?.variance?.toFixed(2) },
          { label: "Std Deviation", value: stats?.stdDev?.toFixed(2) },
          { label: "Data Points", value: stats?.count }
        ].map((stat, i) => (
          <Card key={i} className="border-white/10 rounded-xl glass-card">
            <CardHeader className="p-4 border-b border-white/5">
              <CardDescription className="text-sm text-zinc-400 tracking-wide font-mono tracking-widest">{stat.label}</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-2xl font-bold font-mono">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-white/10 rounded-xl glass-card">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-lg font-heading font-semibold text-white tracking-tight text-xl">Time-Series Analysis</CardTitle>
          <CardDescription className="font-sans text-sm text-zinc-400 uppercase">Adjusted Close Price over Time</CardDescription>
        </CardHeader>
        <CardContent className="p-6 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#a78bfa" opacity={0.1} vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10, fontFamily: 'monospace' }} 
                stroke="#a78bfa"
                tickFormatter={(val) => val.split('-').slice(1).join('/')}
              />
              <YAxis tick={{ fontSize: 10, fontFamily: 'monospace' }} stroke="#a78bfa" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#141414', border: 'none', borderRadius: '0', color: '#E4E3E0', fontFamily: 'monospace', fontSize: '10px' }}
                itemStyle={{ color: '#E4E3E0' }}
              />
              <Area type="monotone" dataKey="close" stroke="#a78bfa" fillOpacity={1} fill="url(#colorClose)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-white/10 rounded-xl glass-card">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-lg font-heading font-semibold text-white tracking-tight text-xl">Daily Returns</CardTitle>
            <CardDescription className="font-sans text-sm text-zinc-400 uppercase">Percentage Change in Adj Close</CardDescription>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#a78bfa" opacity={0.1} vertical={false} />
                <XAxis dataKey="date" hide />
                <YAxis tick={{ fontSize: 10, fontFamily: 'monospace' }} stroke="#a78bfa" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141414', border: 'none', borderRadius: '0', color: '#E4E3E0', fontFamily: 'monospace', fontSize: '10px' }}
                />
                <Bar dataKey="returns" fill="#a78bfa" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-white/10 rounded-xl glass-card">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-lg font-heading font-semibold text-white tracking-tight text-xl">Processed Dataset Summary</CardTitle>
            <CardDescription className="font-sans text-sm text-zinc-400 uppercase">First 5 rows with generated columns</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-zinc-900/50 backdrop-blur-md">
                <TableRow className="border-b border-white/5">
                  <TableHead className="font-sans text-sm text-zinc-400 uppercase">Date</TableHead>
                  <TableHead className="font-sans text-sm text-zinc-400 uppercase">Adj Close</TableHead>
                  <TableHead className="font-sans text-sm text-zinc-400 uppercase">Daily Return</TableHead>
                  <TableHead className="font-sans text-sm text-zinc-400 uppercase">Target (Next Day)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.slice(0, 5).map((row, i) => (
                  <TableRow key={i} className="border-b border-white/5">
                    <TableCell className="font-sans text-sm text-zinc-400">{row.Date}</TableCell>
                    <TableCell className="font-sans text-sm text-zinc-400">{parseFloat(row["Adj Close"]).toFixed(2)}</TableCell>
                    <TableCell className={`font-sans text-sm text-zinc-400 ${row.Daily_Return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {row.Daily_Return.toFixed(2)}%
                    </TableCell>
                    <TableCell className="font-sans text-sm text-zinc-400">{row.Target_Next_Day_Close?.toFixed(2) || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

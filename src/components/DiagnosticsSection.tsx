import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from "recharts";
import { AlertCircle } from "lucide-react";

interface DiagnosticsSectionProps {
  regressionResults: any;
}

export default function DiagnosticsSection({ regressionResults }: DiagnosticsSectionProps) {
  const [diagnostics, setDiagnostics] = useState<any>(null);

  useEffect(() => {
    if (regressionResults) {
      fetch("/api/diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actualVsPredicted: regressionResults.actualVsPredicted }),
      })
        .then(res => res.json())
        .then(data => setDiagnostics(data));
    }
  }, [regressionResults]);

  if (!regressionResults) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center border border-dashed border-white/10/20 glass-card">
        <AlertCircle size={48} className="text-zinc-200/10 mb-4" />
        <p className="text-xs font-medium tracking-wide text-zinc-300 opacity-40">Train Linear Regression model first to see diagnostics</p>
      </div>
    );
  }

  if (!diagnostics) return null;

  const residualData = diagnostics.residuals.map((r: number, i: number) => ({
    index: i,
    residual: r,
    fitted: diagnostics.fitted[i]
  }));

  // Histogram data
  const bins = 20;
  const min = Math.min(...diagnostics.residuals);
  const max = Math.max(...diagnostics.residuals);
  const range = max - min;
  const binWidth = range / bins;
  const histogramData = Array.from({ length: bins }, (_, i) => {
    const binMin = min + i * binWidth;
    const binMax = binMin + binWidth;
    const count = diagnostics.residuals.filter((r: number) => r >= binMin && r < binMax).length;
    return { name: binMin.toFixed(2), count };
  });

  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-white/10 rounded-xl glass-card">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-lg font-heading font-semibold text-white tracking-tight text-xl">Residuals vs Fitted</CardTitle>
            <CardDescription className="font-sans text-sm text-zinc-400 uppercase">Checking for Heteroscedasticity</CardDescription>
          </CardHeader>
          <CardContent className="p-6 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#a78bfa" opacity={0.1} />
                <XAxis type="number" dataKey="fitted" name="Fitted" tick={{ fontSize: 10, fontFamily: 'monospace' }} stroke="#a78bfa" label={{ value: 'Fitted Values', position: 'insideBottom', offset: -5, style: { fontSize: 10, fontFamily: 'monospace' } }} />
                <YAxis type="number" dataKey="residual" name="Residual" tick={{ fontSize: 10, fontFamily: 'monospace' }} stroke="#a78bfa" label={{ value: 'Residuals', angle: -90, position: 'insideLeft', style: { fontSize: 10, fontFamily: 'monospace' } }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#141414', border: 'none', borderRadius: '0', color: '#E4E3E0', fontFamily: 'monospace', fontSize: '10px' }} />
                <Scatter name="Residuals" data={residualData} fill="#a78bfa" />
                <Line type="monotone" data={[{fitted: Math.min(...diagnostics.fitted), residual: 0}, {fitted: Math.max(...diagnostics.fitted), residual: 0}]} dataKey="residual" stroke="#ff4444" strokeDasharray="5 5" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-white/10 rounded-xl glass-card">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-lg font-heading font-semibold text-white tracking-tight text-xl">Residual Histogram</CardTitle>
            <CardDescription className="font-sans text-sm text-zinc-400 uppercase">Checking for Normality of Errors</CardDescription>
          </CardHeader>
          <CardContent className="p-6 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#a78bfa" opacity={0.1} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 8, fontFamily: 'monospace' }} stroke="#a78bfa" />
                <YAxis tick={{ fontSize: 10, fontFamily: 'monospace' }} stroke="#a78bfa" />
                <Tooltip contentStyle={{ backgroundColor: '#141414', border: 'none', borderRadius: '0', color: '#E4E3E0', fontFamily: 'monospace', fontSize: '10px' }} />
                <Bar dataKey="count" fill="#a78bfa" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 rounded-xl glass-card">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-lg font-heading font-semibold text-white tracking-tight text-xl">Cook's Distance (Simplified)</CardTitle>
          <CardDescription className="font-sans text-sm text-zinc-400 uppercase">Identifying Influential Observations</CardDescription>
        </CardHeader>
        <CardContent className="p-6 h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={residualData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#a78bfa" opacity={0.1} vertical={false} />
              <XAxis dataKey="index" tick={{ fontSize: 10, fontFamily: 'monospace' }} stroke="#a78bfa" />
              <YAxis tick={{ fontSize: 10, fontFamily: 'monospace' }} stroke="#a78bfa" />
              <Tooltip contentStyle={{ backgroundColor: '#141414', border: 'none', borderRadius: '0', color: '#E4E3E0', fontFamily: 'monospace', fontSize: '10px' }} />
              <Line type="monotone" dataKey="residual" stroke="#a78bfa" dot={{ r: 2 }} strokeWidth={1} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-[8px] font-medium tracking-wide text-zinc-300 mt-4 opacity-60">
            Note: High absolute residuals often correspond to high Cook's distance, indicating points that significantly influence the regression coefficients.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

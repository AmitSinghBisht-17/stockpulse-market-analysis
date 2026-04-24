import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, BrainCircuit, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ModelSectionProps {
  data: any[];
  regressionResults: any;
  setRegressionResults: (results: any) => void;
  logisticResults: any;
  setLogisticResults: (results: any) => void;
}

export default function ModelSection({ data, regressionResults, setRegressionResults, logisticResults, setLogisticResults }: ModelSectionProps) {
  const [loadingReg, setLoadingReg] = useState(false);
  const [loadingLog, setLoadingLog] = useState(false);

  const runRegression = async () => {
    setLoadingReg(true);
    try {
      const response = await fetch("/api/regression", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      setRegressionResults(result);
    } catch (err: any) {
      toast.error(err.message || "Failed to run Linear Regression", { style: { background: '#ef4444', border: 'none', color: '#fff' }});
      console.error(err);
    } finally {
      setLoadingReg(false);
    }
  };

  const runLogistic = async () => {
    setLoadingLog(true);
    try {
      const response = await fetch("/api/logistic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      setLogisticResults(result);
    } catch (err: any) {
      toast.error(err.message || "Failed to run Logistic Regression", { style: { background: '#ef4444', border: 'none', color: '#fff' }});
      console.error(err);
    } finally {
      setLoadingLog(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Linear Regression */}
        <Card className="border-white/10 rounded-xl glass-card">
          <CardHeader className="border-b border-white/10 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-heading font-semibold text-white tracking-tight text-xl">Linear Regression</CardTitle>
              <CardDescription className="font-sans text-sm text-zinc-400 uppercase">Predicting Next Day Close Price</CardDescription>
            </div>
            <Button 
              onClick={runRegression} 
              disabled={loadingReg}
              className="bg-zinc-800 border border-white/5 text-zinc-400 rounded-xl uppercase text-sm font-medium"
            >
              {loadingReg ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
              Train
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {!regressionResults ? (
              <div className="h-[200px] flex items-center justify-center border border-dashed border-white/10/20 bg-zinc-900/50 backdrop-blur-md">
                <p className="text-sm font-medium tracking-wide text-zinc-300 opacity-40">Run Linear Regression to see results</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-white/10 p-4">
                    <p className="text-[8px] font-medium tracking-wide text-zinc-300 opacity-60">RMSE</p>
                    <p className="text-lg font-bold font-mono">{regressionResults.rmse.toFixed(4)}</p>
                  </div>
                  <div className="border border-white/10 p-4">
                    <p className="text-[8px] font-medium tracking-wide text-zinc-300 opacity-60">R-Squared</p>
                    <p className="text-lg font-bold font-mono">{regressionResults.r2.toFixed(4)}</p>
                  </div>
                </div>

                <div className="h-[250px]">
                  <h4 className="text-sm font-mono font-bold uppercase mb-2">Actual vs Predicted</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#a78bfa" opacity={0.1} />
                      <XAxis type="number" dataKey="actual" name="Actual" tick={{ fontSize: 10, fontFamily: 'monospace' }} stroke="#a78bfa" />
                      <YAxis type="number" dataKey="predicted" name="Predicted" tick={{ fontSize: 10, fontFamily: 'monospace' }} stroke="#a78bfa" />
                      <ZAxis type="number" range={[50, 50]} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#141414', border: 'none', borderRadius: '0', color: '#E4E3E0', fontFamily: 'monospace', fontSize: '10px' }} />
                      <Scatter name="Price" data={regressionResults.actualVsPredicted} fill="#a78bfa" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logistic Regression */}
        <Card className="border-white/10 rounded-xl glass-card">
          <CardHeader className="border-b border-white/10 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-heading font-semibold text-white tracking-tight text-xl">Logistic Regression</CardTitle>
              <CardDescription className="font-sans text-sm text-zinc-400 uppercase">Predicting Direction (Up/Down)</CardDescription>
            </div>
            <Button 
              onClick={runLogistic} 
              disabled={loadingLog}
              className="bg-zinc-800 border border-white/5 text-zinc-400 rounded-xl uppercase text-sm font-medium"
            >
              {loadingLog ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
              Train
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {!logisticResults ? (
              <div className="h-[200px] flex items-center justify-center border border-dashed border-white/10/20 bg-zinc-900/50 backdrop-blur-md">
                <p className="text-sm font-medium tracking-wide text-zinc-300 opacity-40">Run Logistic Regression to see results</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-center p-8 bg-zinc-800 border border-white/5 text-zinc-400">
                  <div className="text-center">
                    <p className="text-sm font-medium tracking-wide text-zinc-300 opacity-60 mb-1">Model Accuracy</p>
                    <p className="text-5xl font-bold font-mono">{(logisticResults.accuracy * 100).toFixed(1)}%</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-mono font-bold uppercase mb-4 border-b border-white/5 pb-2">Confusion Matrix</h4>
                  <div className="grid grid-cols-3 gap-2 text-center font-sans text-sm text-zinc-400">
                    <div className="p-2"></div>
                    <div className="p-2 bg-zinc-900/50 backdrop-blur-md font-bold">PRED DOWN</div>
                    <div className="p-2 bg-zinc-900/50 backdrop-blur-md font-bold">PRED UP</div>
                    
                    <div className="p-2 bg-zinc-900/50 backdrop-blur-md font-bold flex items-center justify-center">ACTUAL DOWN</div>
                    <div className="p-4 border border-white/10">{logisticResults.confusionMatrix[0][0]}</div>
                    <div className="p-4 border border-white/10">{logisticResults.confusionMatrix[0][1]}</div>
                    
                    <div className="p-2 bg-zinc-900/50 backdrop-blur-md font-bold flex items-center justify-center">ACTUAL UP</div>
                    <div className="p-4 border border-white/10">{logisticResults.confusionMatrix[1][0]}</div>
                    <div className="p-4 border border-white/10">{logisticResults.confusionMatrix[1][1]}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {regressionResults && (
        <Card className="border-white/10 rounded-xl glass-card">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-lg font-heading font-semibold text-white tracking-tight text-xl">Model Coefficients</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-zinc-900/50 backdrop-blur-md">
                <TableRow className="border-b border-white/5">
                  <TableHead className="font-sans text-sm text-zinc-400 uppercase">Variable</TableHead>
                  <TableHead className="font-sans text-sm text-zinc-400 uppercase">Coefficient</TableHead>
                  <TableHead className="font-sans text-sm text-zinc-400 uppercase">Impact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {["Intercept", "Open", "High", "Low", "Volume", "Daily_Return"].map((v, i) => (
                  <TableRow key={i} className="border-b border-white/5">
                    <TableCell className="font-sans text-sm text-zinc-400 font-bold">{v}</TableCell>
                    <TableCell className="font-sans text-sm text-zinc-400">{regressionResults.coefficients[i][0].toFixed(6)}</TableCell>
                    <TableCell className="font-sans text-sm text-zinc-400">
                      {regressionResults.coefficients[i][0] > 0 ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200 rounded-xl text-[8px] uppercase"><ArrowUpRight size={10} className="mr-1" /> Positive</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 border-red-200 rounded-xl text-[8px] uppercase"><ArrowDownRight size={10} className="mr-1" /> Negative</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

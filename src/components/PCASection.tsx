import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Binary } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PCASectionProps {
  data: any[];
  results: any;
  setResults: (results: any) => void;
}

export default function PCASection({ data, results, setResults }: PCASectionProps) {
  const [loading, setLoading] = useState(false);

  const runPCA = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/pca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      setResults(result);
    } catch (err: any) {
      toast.error(err.message || "Failed to run PCA", { style: { background: '#ef4444', border: 'none', color: '#fff' }});
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const features = ["Open", "High", "Low", "Volume"];

  return (
    <div className="grid gap-6">
      <Card className="border-white/10 rounded-xl glass-card">
        <CardHeader className="border-b border-white/10 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-heading font-semibold text-white tracking-tight text-xl">Principal Component Analysis</CardTitle>
            <CardDescription className="font-sans text-sm text-zinc-400 uppercase">Dimensionality Reduction on [Open, High, Low, Volume]</CardDescription>
          </div>
          <Button 
            onClick={runPCA} 
            disabled={loading}
            className="bg-zinc-800 border border-white/5 text-zinc-400 rounded-xl uppercase text-sm font-medium"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Binary className="mr-2 h-4 w-4" />}
            Compute PCA
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          {!results ? (
            <div className="h-[300px] flex flex-col items-center justify-center border border-dashed border-white/10/20 bg-zinc-900/50 backdrop-blur-md">
              <Binary size={48} className="text-zinc-200/10 mb-4" />
              <p className="text-xs font-medium tracking-wide text-zinc-300 opacity-40">Click the button to run PCA</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase mb-4 border-b border-white/5 pb-2">Scree Plot (Explained Variance)</h4>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.explainedVariance.map((v: number, i: number) => ({ name: `PC${i+1}`, value: v * 100 }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#a78bfa" opacity={0.1} vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: 'monospace' }} stroke="#a78bfa" />
                        <YAxis tick={{ fontSize: 10, fontFamily: 'monospace' }} stroke="#a78bfa" label={{ value: '% Variance', angle: -90, position: 'insideLeft', style: { fontSize: 10, fontFamily: 'monospace' } }} />
                        <Tooltip contentStyle={{ backgroundColor: '#141414', border: 'none', borderRadius: '0', color: '#E4E3E0', fontFamily: 'monospace', fontSize: '10px' }} />
                        <Bar dataKey="value" fill="#a78bfa" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono font-bold uppercase mb-4 border-b border-white/5 pb-2">Eigenvalues</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {results.eigenvalues.map((val: number, i: number) => (
                      <div key={i} className="border border-white/10 p-2 text-center">
                        <p className="text-[8px] font-medium tracking-wide text-zinc-300 opacity-60">PC{i+1}</p>
                        <p className="text-xs font-bold font-mono">{val.toFixed(4)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase mb-4 border-b border-white/5 pb-2">Feature Loadings (Eigenvectors)</h4>
                  <div className="overflow-x-auto border border-white/10">
                    <Table>
                      <TableHeader className="bg-zinc-800 border border-white/5">
                        <TableRow className="hover:bg-zinc-800 border border-white/5 border-none">
                          <TableHead className="text-zinc-400 font-sans text-sm text-zinc-400 uppercase h-8">Feature</TableHead>
                          {results.eigenvectors[0].map((_: any, i: number) => (
                            <TableHead key={i} className="text-zinc-400 font-sans text-sm text-zinc-400 uppercase h-8">PC{i+1}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {features.map((feature, i) => (
                          <TableRow key={i} className="border-b border-white/5">
                            <TableCell className="font-sans text-sm text-zinc-400 font-bold bg-zinc-900/50 backdrop-blur-md">{feature}</TableCell>
                            {results.eigenvectors[i].map((val: number, j: number) => (
                              <TableCell key={j} className="font-sans text-sm text-zinc-400">
                                {val.toFixed(4)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="bg-zinc-800 border border-white/5 p-6 text-zinc-400">
                  <h4 className="text-xs font-mono font-bold uppercase mb-2">Interpretation</h4>
                  <p className="text-sm font-medium tracking-wide text-zinc-300 leading-relaxed opacity-80">
                    The first principal component (PC1) explains <span className="text-white font-bold">{(results.explainedVariance[0] * 100).toFixed(2)}%</span> of the total variance. 
                    Loadings indicate the contribution of each original feature to the components.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Info, CheckCircle2, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface HypothesisSectionProps {
  data: any[];
  results: any;
  setResults: (results: any) => void;
}

export default function HypothesisSection({ data, results, setResults }: HypothesisSectionProps) {
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/hypothesis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      const result = await response.json();
      setResults(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <Card className="border-white/10 rounded-xl glass-card">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-lg font-heading font-semibold text-white tracking-tight text-xl">Hypothesis Testing</CardTitle>
          <CardDescription className="font-sans text-sm text-zinc-400 uppercase">Two-Sample T-Test: Volume on Up-Days vs Down-Days</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-4">
              <div className="bg-zinc-900/50 backdrop-blur-md p-4 border-l-4 border-white/10">
                <h4 className="text-xs font-mono font-bold uppercase mb-2">Null Hypothesis (H₀)</h4>
                <p className="text-sm font-medium tracking-wide text-zinc-300 text-zinc-200/70">
                  There is no significant difference in the average trading volume between days when the stock price increases (Up-Days) and days when it decreases (Down-Days).
                </p>
              </div>
              <div className="bg-zinc-900/50 backdrop-blur-md p-4 border-l-4 border-white/10/40">
                <h4 className="text-xs font-mono font-bold uppercase mb-2">Alternative Hypothesis (H₁)</h4>
                <p className="text-sm font-medium tracking-wide text-zinc-300 text-zinc-200/70">
                  There is a significant difference in the average trading volume between Up-Days and Down-Days.
                </p>
              </div>
              <Button 
                onClick={runTest} 
                disabled={loading}
                className="bg-zinc-800 border border-white/5 text-zinc-400 rounded-xl uppercase text-sm font-medium px-8"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Execute T-Test"}
              </Button>
            </div>

            {results && (
              <div className="flex-1 w-full space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-white/10 p-4">
                    <p className="text-sm font-medium tracking-wide text-zinc-300 opacity-60">T-Statistic</p>
                    <p className="text-xl font-bold font-mono">{results.tStat.toFixed(4)}</p>
                  </div>
                  <div className="border border-white/10 p-4">
                    <p className="text-sm font-medium tracking-wide text-zinc-300 opacity-60">P-Value</p>
                    <p className="text-xl font-bold font-mono">{results.pValue.toFixed(4)}</p>
                  </div>
                </div>

                <Alert className={`rounded-xl border-2 ${results.pValue < 0.05 ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50'}`}>
                  {results.pValue < 0.05 ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                  <AlertTitle className="text-sm font-medium uppercase font-bold">Conclusion</AlertTitle>
                  <AlertDescription className="font-sans text-sm text-zinc-400 uppercase font-bold">
                    {results.conclusion} (α = 0.05)
                  </AlertDescription>
                </Alert>

                <div className="text-sm font-medium tracking-wide text-zinc-300 text-zinc-200/60 leading-relaxed">
                  <p>Degrees of Freedom: {results.df}</p>
                  <p className="mt-2">
                    Interpretation: {results.pValue < 0.05 
                      ? "The data provides strong evidence that trading volume differs significantly between up and down market days." 
                      : "The data does not provide enough evidence to suggest that trading volume differs significantly between up and down market days."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

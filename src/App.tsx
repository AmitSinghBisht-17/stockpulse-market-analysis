/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Upload, BarChart3, Binary, BrainCircuit, Activity, Download, Info } from "lucide-react";
import UploadSection from "./components/UploadSection";
import EDASection from "./components/EDASection";
import PCASection from "./components/PCASection";
import ModelSection from "./components/ModelSection";
import DiagnosticsSection from "./components/DiagnosticsSection";
import HypothesisSection from "./components/HypothesisSection";

export default function App() {
  const [dataset, setDataset] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [pcaResults, setPcaResults] = useState<any>(null);
  const [regressionResults, setRegressionResults] = useState<any>(null);
  const [logisticResults, setLogisticResults] = useState<any>(null);
  const [hypothesisResults, setHypothesisResults] = useState<any>(null);

  const handleDataUpload = (data: any[], statistics: any) => {
    setDataset(data);
    setStats(statistics);
    toast.success("Dataset uploaded and processed successfully", {
      style: { background: '#18181b', border: '1px solid #27272a', color: '#fafafa' }
    });
  };

  return (
    <div className="min-h-screen selection:bg-violet-500/30 selection:text-white">
      <header className="border-b border-white/5 p-6 flex justify-between items-center glass-panel sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.3)] border border-white/10">
            <Activity className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-heading bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent drop-shadow-md">StockPulse</h1>
            <p className="text-xs font-semibold text-zinc-500 tracking-wider font-sans mt-0.5">MARKET ANALYSIS & PREDICTION SYSTEM</p>
          </div>
        </div>
        <div className="flex gap-4">
          {dataset.length > 0 && (
            <button 
              onClick={() => {
                const headers = Object.keys(dataset[0]);
                const csvRows = [
                  headers.join(','),
                  ...dataset.map(row =>
                    headers.map(h => {
                      const val = row[h] ?? '';
                      const str = String(val);
                      return str.includes(',') || str.includes('"') || str.includes('\n')
                        ? `"${str.replace(/"/g, '""')}"`
                        : str;
                    }).join(',')
                  )
                ].join('\n');
                const blob = new Blob([csvRows], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'processed_stock_data.csv';
                a.click();
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-violet-500/50 hover:bg-zinc-800 transition-all shadow-lg text-sm font-medium text-zinc-300"
            >
              <Download size={16} className="text-violet-400" /> Export Data
            </button>
          )}
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto min-h-[calc(100vh-100px)] relative">
        <Tabs defaultValue="upload" className="flex-col space-y-8 relative z-10 animate-in fade-in duration-700 slide-in-from-bottom-4">
          <div className="flex justify-center mb-10">
            <TabsList className="bg-zinc-900/50 border border-white/5 backdrop-blur-md p-1.5 rounded-xl flex-wrap justify-center gap-2 shadow-xl">
              <TabsTrigger value="upload" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg px-6 py-2.5 text-sm font-medium transition-all">
                <Upload size={16} className="mr-2 opacity-70" /> Upload
              </TabsTrigger>
              <TabsTrigger value="eda" disabled={dataset.length === 0} className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg px-6 py-2.5 text-sm font-medium transition-all disabled:opacity-30">
                <BarChart3 size={16} className="mr-2 opacity-70" /> EDA
              </TabsTrigger>
              <TabsTrigger value="hypothesis" disabled={dataset.length === 0} className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg px-6 py-2.5 text-sm font-medium transition-all disabled:opacity-30">
                <Info size={16} className="mr-2 opacity-70" /> Hypothesis
              </TabsTrigger>
              <TabsTrigger value="pca" disabled={dataset.length === 0} className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg px-6 py-2.5 text-sm font-medium transition-all disabled:opacity-30">
                <Binary size={16} className="mr-2 opacity-70" /> PCA
              </TabsTrigger>
              <TabsTrigger value="models" disabled={dataset.length === 0} className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg px-6 py-2.5 text-sm font-medium transition-all disabled:opacity-30">
                <BrainCircuit size={16} className="mr-2 opacity-70" /> Models
              </TabsTrigger>
              <TabsTrigger value="diagnostics" disabled={dataset.length === 0} className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg px-6 py-2.5 text-sm font-medium transition-all disabled:opacity-30">
                <Activity size={16} className="mr-2 opacity-70" /> Diagnostics
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="upload" className="mt-0 outline-none">
            <UploadSection onUpload={handleDataUpload} />
          </TabsContent>

          <TabsContent value="eda" className="mt-0 outline-none">
            <EDASection data={dataset} stats={stats} />
          </TabsContent>

          <TabsContent value="hypothesis" className="mt-0 outline-none">
            <HypothesisSection data={dataset} results={hypothesisResults} setResults={setHypothesisResults} />
          </TabsContent>

          <TabsContent value="pca" className="mt-0 outline-none">
            <PCASection data={dataset} results={pcaResults} setResults={setPcaResults} />
          </TabsContent>

          <TabsContent value="models" className="mt-0 outline-none">
            <ModelSection 
              data={dataset} 
              regressionResults={regressionResults} 
              setRegressionResults={setRegressionResults}
              logisticResults={logisticResults}
              setLogisticResults={setLogisticResults}
            />
          </TabsContent>

          <TabsContent value="diagnostics" className="mt-0 outline-none">
            <DiagnosticsSection regressionResults={regressionResults} />
          </TabsContent>
        </Tabs>
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}

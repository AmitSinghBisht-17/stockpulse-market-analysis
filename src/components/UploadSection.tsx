import * as React from "react";
import { useState } from "react";
import Papa from "papaparse";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileText, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface UploadSectionProps {
  onUpload: (data: any[], stats: any) => void;
}

const REQUIRED_COLUMNS = ["Date", "Open", "High", "Low", "Close", "Adj Close", "Volume"];

export default function UploadSection({ onUpload }: UploadSectionProps) {
  const [preview, setPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [rawDataset, setRawDataset] = useState<any[]>([]);
  const [uploadedHeaders, setUploadedHeaders] = useState<string[]>([]);
  const [mappingNeeded, setMappingNeeded] = useState(false);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});

  const processExtractedData = async (data: any[]) => {
    if (data.length === 0) {
      setError("Dataset is empty");
      setLoading(false);
      return;
    }

    const headers = Object.keys(data[0]);
    setUploadedHeaders(headers);
    setRawDataset(data);
    
    // Auto-map if perfectly matching or close
    const initialMap: Record<string, string> = {};
    let missingAny = false;

    REQUIRED_COLUMNS.forEach(reqObj => {
      // Auto-detect based on string similarity or exact match
      const exactMatch = headers.find(h => h.trim().toLowerCase() === reqObj.toLowerCase());
      if (exactMatch) {
        initialMap[reqObj] = exactMatch;
      } else {
        initialMap[reqObj] = "";
        missingAny = true;
      }
    });

    setColumnMap(initialMap);

    if (missingAny) {
      setMappingNeeded(true);
      setLoading(false);
      return;
    }

    // If completely matched, proceed automatically
    await submitMappedData(data, initialMap);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setMappingNeeded(false);

    if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const jsonText = e.target?.result as string;
          const data = JSON.parse(jsonText);
          if (!Array.isArray(data)) throw new Error("JSON must be an array of objects");
          await processExtractedData(data);
        } catch (err: any) {
          setError("Failed to parse JSON: " + err.message);
          setLoading(false);
        }
      };
      reader.readAsText(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          if (results.errors.length > 0) {
            setError("Error parsing CSV file");
            setLoading(false);
            return;
          }
          await processExtractedData(results.data);
        },
      });
    }
  };

  const submitMappedData = async (data: any[], activeMap: Record<string, string>) => {
    setLoading(true);
    setMappingNeeded(false);
    setError(null);

    // Validate if any map is empty
    const missingMaps = Object.entries(activeMap).filter(([k, v]) => !v);
    if (missingMaps.length > 0) {
      setError(`Please map all columns. Missing: ${missingMaps.map(([k]) => k).join(', ')}`);
      setMappingNeeded(true);
      setLoading(false);
      return;
    }

    // Reconstruct data with exact required keys
    const mappedData = data.map(row => {
      const newRow: any = {};
      REQUIRED_COLUMNS.forEach(reqCol => {
        newRow[reqCol] = row[activeMap[reqCol]];
      });
      return newRow;
    });

    setPreview(mappedData.slice(0, 10));

    try {
      const response = await fetch("/api/eda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: mappedData }),
      });
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      
      onUpload(result.processed, result.stats);
    } catch (err: any) {
      setError(err.message || "Failed to process data on server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <Card className="border-white/10 rounded-xl glass-card">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-lg font-heading font-semibold text-white tracking-tight text-xl">Data Ingestion</CardTitle>
          <CardDescription className="font-sans text-sm text-zinc-400 uppercase">Upload your stock market dataset (CSV or JSON format)</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          {!mappingNeeded ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 p-12 bg-zinc-900/50 backdrop-blur-md transition-all hover:bg-zinc-800/80 hover:border-violet-500/50 group relative">
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={loading}
              />
              <Upload className="w-12 h-12 mb-4 text-zinc-200/40 group-hover:text-zinc-200 transition-colors" />
              <p className="text-sm font-bold tracking-wide text-zinc-300">Click or drag CSV/JSON file here</p>
              <p className="text-sm text-zinc-200/60 mt-2 uppercase">Required Fields: Date, Open, High, Low, Close, Adj Close, Volume</p>
              {loading && (
                <div className="mt-4 flex items-center gap-2 text-xs font-mono animate-pulse">
                  <div className="w-2 h-2 bg-zinc-800 border border-white/5 rounded-full animate-bounce" />
                  Processing...
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2 text-zinc-200">
                <AlertCircle size={20} className="text-amber-500" />
                <span className="text-sm font-bold tracking-wide text-zinc-300">Map Your Columns</span>
              </div>
              <p className="text-sm text-zinc-400">Your dataset contains unrecognized headers. Please match your file's columns to the required StockPulse features.</p>
              
              <div className="grid gap-4 mt-6">
                {REQUIRED_COLUMNS.map(reqCol => (
                  <div key={reqCol} className="flex items-center justify-between p-3 border border-white/10 bg-zinc-900/50 rounded-lg">
                    <span className="text-sm font-bold text-white w-1/3">{reqCol}</span>
                    <ArrowRight className="text-zinc-500 w-4 h-4 mx-4" />
                    <select 
                      className="w-2/3 bg-zinc-800 border border-white/10 text-zinc-200 p-2 rounded-md outline-none focus:border-violet-500/50 text-sm"
                      value={columnMap[reqCol]}
                      onChange={(e) => setColumnMap({...columnMap, [reqCol]: e.target.value})}
                    >
                      <option value="">-- Select matching column --</option>
                      {uploadedHeaders.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-4 mt-6">
                 <Button onClick={() => setMappingNeeded(false)} variant="outline" className="bg-transparent border-white/10 text-white rounded-lg">Cancel</Button>
                 <Button onClick={() => submitMappedData(rawDataset, columnMap)} className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg" disabled={loading}>
                   {loading ? <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin mr-2" /> : null}
                   Confirm & Process
                 </Button>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-6 rounded-xl border-white/10">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-sm font-medium uppercase font-bold">Error</AlertTitle>
              <AlertDescription className="font-sans text-xs text-zinc-400 uppercase">{error}</AlertDescription>
            </Alert>
          )}

          {preview.length > 0 && !error && !mappingNeeded && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4 text-zinc-200">
                <CheckCircle2 size={16} className="text-green-600" />
                <span className="text-xs font-bold tracking-wide text-zinc-300">Preview (First 10 rows)</span>
              </div>
              <ScrollArea className="h-[300px] border border-white/10">
                <Table>
                  <TableHeader className="bg-zinc-800 border border-white/5 sticky top-0 z-20">
                    <TableRow className="hover:bg-zinc-800 border border-white/5 border-none">
                      {Object.keys(preview[0]).map((header) => (
                        <TableHead key={header} className="text-zinc-400 font-sans text-xs text-zinc-400 uppercase h-10">
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row, i) => (
                      <TableRow key={i} className="border-b border-white/5 hover:bg-zinc-800/80">
                        {Object.values(row).map((val: any, j) => (
                          <TableCell key={j} className="font-sans text-sm text-zinc-400 py-2">
                            {val}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-white/10 rounded-xl glass-card">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-lg font-heading font-semibold text-white tracking-tight text-xl">Sample Dataset Info</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase border-b border-white/5 pb-2">Expected Format</h4>
              <ul className="space-y-2 text-sm font-medium tracking-wide text-zinc-300/70">
                <li className="flex justify-between"><span>Date</span> <span className="text-zinc-200">YYYY-MM-DD</span></li>
                <li className="flex justify-between"><span>Open / High / Low / Close</span> <span className="text-zinc-200">Numeric</span></li>
                <li className="flex justify-between"><span>Adj Close</span> <span className="text-zinc-200">Numeric (Target Base)</span></li>
                <li className="flex justify-between"><span>Volume</span> <span className="text-zinc-200">Integer</span></li>
              </ul>
            </div>
            <div className="bg-zinc-800 border border-white/5 p-6 text-zinc-400 flex flex-col justify-center">
              <FileText className="mb-4 opacity-50" size={32} />
              <p className="text-xs font-medium tracking-wide text-zinc-300 leading-relaxed">
                The system will automatically generate <span className="text-white font-bold">Daily_Return</span> and <span className="text-white font-bold">Target_Next_Day_Close</span> columns for predictive modeling.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

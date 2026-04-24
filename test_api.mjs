import fs from 'fs';

async function run() {
  try {
    const rawData = fs.readFileSync('sample_stock_data.csv', 'utf8');
    const lines = rawData.split('\n').filter(Boolean);
    const headers = lines[0].split(',');
    
    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((h, i) => obj[h] = values[i]);
      return obj;
    });

    // 1. EDA
    console.log("Testing EDA...");
    const edaRes = await fetch('http://localhost:3000/api/eda', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data })
    });
    const edaResult = await edaRes.json();
    console.log("EDA Finished with rows:", edaResult.processed.length);

    // 2. PCA
    console.log("Testing PCA...");
    const pcaRes = await fetch('http://localhost:3000/api/pca', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: edaResult.processed })
    });
    const pcaResult = await pcaRes.text();
    console.log("PCA Result:", pcaResult.substring(0, 500));

    // 3. Regression
    console.log("Testing Regression...");
    const regRes = await fetch('http://localhost:3000/api/regression', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: edaResult.processed })
    });
    const regResult = await regRes.text();
    console.log("Regression Result:", regResult.substring(0, 500));

  } catch (err) {
    console.error("Error:", err);
  }
}

run();

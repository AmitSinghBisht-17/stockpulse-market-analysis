# 📈 StockPulse — Market Analysis & Prediction System

A full-stack stock market analysis platform that lets you upload historical stock data (CSV) and perform comprehensive analysis including:

- **EDA** — Exploratory Data Analysis with interactive charts
- **Hypothesis Testing** — T-tests on volume vs. price movement
- **PCA** — Principal Component Analysis with variance decomposition
- **Linear Regression** — Predict next-day closing prices with RMSE/R² metrics
- **Logistic Regression** — Classify up/down days with confusion matrix
- **Diagnostics** — Residual analysis and model diagnostics

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Charts | Recharts |
| Backend | Express.js + TypeScript |
| ML | ml-pca, ml-regression, ml-logistic-regression |
| Stats | simple-statistics |

## 🚀 Run Locally

**Prerequisites:** Node.js 18+

1. Clone the repo:
   ```bash
   git clone https://github.com/AmitSinghBisht-17/stockpulse-market-analysis.git
   cd stockpulse-market-analysis
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the env file and add your Gemini API key (optional — only needed for AI features):
   ```bash
   cp .env.example .env
   # Edit .env and set GEMINI_API_KEY=your_key_here
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## 📦 Build for Production

```bash
npm run build   # builds Vite frontend into /dist
npm run start   # serves the built app via Express
```

## 📂 Project Structure

```
stockpulse-market-analysis/
├── src/
│   ├── components/        # React UI components (EDA, PCA, Models, etc.)
│   ├── App.tsx            # Root app with tab navigation
│   └── index.css          # Global styles
├── components/ui/         # shadcn/ui component library
├── server.ts              # Express backend (API routes + Vite middleware)
├── vite.config.ts         # Vite configuration
└── sample_stock_data.csv  # Sample dataset to try the app
```

## 📊 Sample Data

A sample CSV file (`sample_stock_data.csv`) is included. It expects columns:
`Date, Open, High, Low, Close, Adj Close, Volume`

## 📄 License

MIT

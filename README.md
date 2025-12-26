# FinBoard - Advanced Personal Finance Dashboard

FinBoard is a highly customizable, real-time finance dashboard built with Next.js, TypeScript, and Tailwind CSS. It allows users to track stocks, crypto, and market trends using interactive widgets.

## 🚀 Features

### Core Functionality
- **Dynamic Widget System**: Add, remove, resize, and reorder widgets (Card, Table, Chart, Accordion, Watchlist, Market).
- **Edit Configuration**: Modify existing widgets on the fly.
- **Real-Time Data**: Live price updates using WebSockets (Finnhub).
- **Multiple Data Sources**: 
  - Finnhub (US Stocks, Candles)
  - Alpha Vantage (Global Quotes, Top Gainers)
  - Indian Stock API (NSE/BSE)
  - CoinGecko (Resilient Crypto Prices)

### Visualization & API
- **Interactive Charts**: Switch between Area (Line) and Candle (Bar) representations with adjustable time intervals (Day, Week, Month).
- **Specialized Widgets**:
  - **Watchlist**: Track multiple tickers with live color-coded updates.
  - **Market**: View Top Gainers/Losers.
  - **Tables**: Sortable and paginated data tables.

### UX & Personalization
- **Theme Support**: Seamless Dark/Light mode switching.
- **Templates**: One-click dashboard setups (US Tech, Crypto Tracker, Indian Market).
- **Persistence**: Dashboard layout and settings are saved automatically to local storage.
- **Export/Import**: Backup your dashboard configuration to a JSON file and restore it later.

## 🛠️ Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn UI patterns
- **State Management**: Zustand (with Persist middleware)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Grid Layout**: React-Grid-Layout

## ⚙️ Setup & Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/finboard.git
    cd finboard
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env.local` file in the root directory:
    ```env
    NEXT_PUBLIC_FINNHUB_TOKEN=your_finnhub_api_key
    NEXT_PUBLIC_ALPHAVANTAGE_TOKEN=your_alphavantage_key
    ```
    *Note: Get free keys from [Finnhub](https://finnhub.io/) and [Alpha Vantage](https://www.alphavantage.co/).*

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage Guide

- **Adding a Widget**: Click the "+ Add Widget" button. Select a type (e.g., Chart) and use a preset (e.g., Finnhub Stock) or enter a custom API URL.
- **Editing**: Click the Pencil icon on any widget header to modify its title or settings.
- **Layout**: Drag widget headers to move them. Drag the bottom-right corner to resize.
- **Templates**: Use the dropdown in the header to load a pre-configured dashboard.

## 🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request.

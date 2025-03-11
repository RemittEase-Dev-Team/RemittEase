import React, { useEffect, useRef } from 'react';

const CryptoTickerWidget: React.FC = () => {
  const container = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
    {
      "symbols": [
        {
          "proName": "BINANCE:XLMUSD",
          "title": "Stellar to USD"
        },
        {
          "proName": "FX_IDC:EURUSD",
          "title": "EUR to USD"
        },
        {
          "proName": "BITSTAMP:BTCUSD",
          "title": "Bitcoin"
        },
        {
          "proName": "BITSTAMP:ETHUSD",
          "title": "Ethereum"
        },
        {
          "description": "",
          "proName": "BINANCE:BTCUSDT"
        },
        {
          "description": "",
          "proName": "COINBASE:SOLUSD"
        },
        {
          "description": "",
          "proName": "BINANCE:DOGEUSDT"
        },
        {
          "description": "",
          "proName": "BINANCE:AVAXUSDT"
        },
        {
          "description": "",
          "proName": "BINANCE:XRPUSDT"
        },
        {
          "description": "",
          "proName": "MEXC:BTCUSDT.P"
        },
        {
          "description": "",
          "proName": "BYBIT:SOLUSDT.P"
        },
        {
          "description": "",
          "proName": "CRYPTOCAP:USDT.D"
        },
        {
          "description": "",
          "proName": "BINANCE:TRXUSDT"
        }
      ],
      "showSymbolLogo": true,
      "isTransparent": false,
      "displayMode": "adaptive",
      "colorTheme": "dark",
      "locale": "en"
    }`;

    if (container.current) {
      container.current.appendChild(script);
    }

    return () => {
      if (container.current && script) {
        container.current.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

export default CryptoTickerWidget;

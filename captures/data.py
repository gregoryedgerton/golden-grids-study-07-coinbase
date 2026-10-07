#!/usr/bin/env python3
"""Fetch the study's market data into src/data/.

    python3 captures/data.py

Sources, all public and none from the reference site's pages:
  - Coinbase Exchange public API (api.exchange.coinbase.com): 24-hour stats
    and candles for every asset. The snapshot time is the newest candle.
  - CoinGecko public API: market capitalisation, circulating supply and
    all-time high (attributed in the colophon, as its terms ask).
  - Wikipedia REST summaries for the four assets with pages of their own,
    CC BY-SA 4.0, attributed on the page.
The portfolio in src/portfolio.ts is fictional; nothing here is a holding.
"""
import json, os, time, urllib.request, urllib.parse
from datetime import datetime, timezone, timedelta

UA = {"User-Agent": "golden-grids-study/1.0 (gregory@humblehumans.com)"}
ASSETS = [  # symbol, CoinGecko id, Wikipedia title (None where the article is thin)
    ("BTC", "bitcoin", "Bitcoin"), ("ETH", "ethereum", "Ethereum"), ("SOL", "solana", "Solana_(blockchain_platform)"), ("XRP", "ripple", "XRP_Ledger"),
    ("DOGE", "dogecoin", "Dogecoin"), ("ADA", "cardano", "Cardano_(blockchain_platform)"), ("AVAX", "avalanche-2", "Avalanche_(blockchain_platform)"), ("LINK", "chainlink", "Chainlink_(blockchain)"),
    ("LTC", "litecoin", "Litecoin"), ("BCH", "bitcoin-cash", "Bitcoin_Cash"), ("DOT", "polkadot", "Polkadot_(blockchain_platform)"), ("UNI", "uniswap", "Uniswap"),
]
PAGES = {"BTC", "ETH", "SOL", "XRP"}  # assets with a page of their own: full history

def get(url, retries=4):
    for i in range(retries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
                return json.load(r)
        except Exception as e:
            if i == retries - 1: raise
            time.sleep(2 * (i + 1))

def candles(product, granularity, start=None, end=None):
    q = {"granularity": granularity}
    if start: q["start"] = start.strftime("%Y-%m-%dT%H:%M:%SZ")
    if end: q["end"] = end.strftime("%Y-%m-%dT%H:%M:%SZ")
    rows = get(f"https://api.exchange.coinbase.com/products/{product}/candles?{urllib.parse.urlencode(q)}")
    rows.sort(key=lambda r: r[0])
    return [{"t": r[0], "c": round(r[4], 6), "v": round(r[5], 3)} for r in rows]

def daily_history(product):
    """Every daily close since listing: pages of 300 back to the first candle."""
    out, end = [], datetime.now(timezone.utc)
    while True:
        rows = candles(product, 86400, end - timedelta(days=299), end)
        if not rows: break
        out = rows + out
        end = datetime.fromtimestamp(rows[0]["t"], timezone.utc) - timedelta(days=1)
        time.sleep(0.25)
        if len(out) > 5000: break
    seen, uniq = set(), []
    for r in out:
        if r["t"] not in seen: seen.add(r["t"]); uniq.append(r)
    return uniq

def main():
    os.makedirs("src/data", exist_ok=True)
    gecko = {c["symbol"].upper(): c for c in get("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=" + ",".join(g for _, g, _ in ASSETS) + ",usd-coin&order=market_cap_desc")}
    assets = {}
    for sym, gid, wiki in ASSETS:
        product = f"{sym}-USD"
        stats = get(f"https://api.exchange.coinbase.com/products/{product}/stats")
        series = {
            "1D": candles(product, 300)[-288:],      # five-minute closes, the last 24 hours
            "1W": candles(product, 3600)[-168:],     # hourly, seven days
            "1M": candles(product, 21600)[-124:],    # six-hourly, thirty-one days
            "1Y": candles(product, 86400, datetime.now(timezone.utc) - timedelta(days=299), datetime.now(timezone.utc)),
        }
        if sym in PAGES:
            hist = daily_history(product)
            series["1Y"] = [r for r in hist if r["t"] >= hist[-1]["t"] - 365 * 86400]
            series["ALL"] = hist[::7] if len(hist) > 1500 else hist
        g = gecko.get(sym, {})
        w = None
        if wiki:
            s = get(f"https://en.wikipedia.org/api/rest_v1/page/summary/{wiki}")
            w = {"title": s["title"], "url": s["content_urls"]["desktop"]["page"], "extract": s["extract"], "revision": s.get("revision"), "timestamp": s.get("timestamp")}
        last = series["1D"][-1]
        assets[sym] = {
            "symbol": sym, "name": g.get("name") or sym, "product": product,
            "price": last["c"], "asOf": last["t"],
            "open24": float(stats["open"]), "high24": float(stats["high"]), "low24": float(stats["low"]), "volume24": float(stats["volume"]), "volume30d": float(stats["volume_30day"]),
            "marketCap": g.get("market_cap"), "supply": g.get("circulating_supply"), "maxSupply": g.get("max_supply"), "ath": g.get("ath"), "athDate": (g.get("ath_date") or "")[:10], "rank": g.get("market_cap_rank"),
            "series": series, "wiki": w,
        }
        print(sym, last["c"], "24h", stats["open"], "→", last["c"], "cap", g.get("market_cap"), "points", {k: len(v) for k, v in series.items()})
        time.sleep(0.3)
    usdc = gecko.get("USDC", {})
    learn = {}
    for key, title in [("blockchain", "Blockchain"), ("stablecoin", "Stablecoin"), ("staking", "Proof_of_stake"), ("wallet", "Cryptocurrency_wallet"), ("defi", "Decentralized_finance")]:
        s = get(f"https://en.wikipedia.org/api/rest_v1/page/summary/{title}")
        learn[key] = {"title": s["title"], "url": s["content_urls"]["desktop"]["page"], "extract": s["extract"], "revision": s.get("revision"), "timestamp": s.get("timestamp")}
    meta = {"fetched": datetime.now(timezone.utc).isoformat(timespec="seconds"), "asOf": max(a["asOf"] for a in assets.values()), "usdc": {"price": usdc.get("current_price"), "marketCap": usdc.get("market_cap")}}
    json.dump({"meta": meta, "assets": assets, "learn": learn}, open("src/data/market.json", "w"), separators=(",", ":"))
    print("wrote src/data/market.json", os.path.getsize("src/data/market.json"), "bytes")

if __name__ == "__main__":
    main()

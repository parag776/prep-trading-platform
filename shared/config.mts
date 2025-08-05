const config = {
    "trade_book_size": 50,
    "order_history_size": 50,
    "leverage_min": 1,
    "leverage_max": 100,
    "taker_fee": 0.0004,
    "maker_fee": 0.0,
    "maintainence_margin": 0.005,
    "interest_rate": 0.0001, // per interval
    "funding_interval_in_seconds": 8 * 60 * 60 , // 8 hours in seconds
    "impact_margin_notional": 5000,
    "min_order_ratio": 0.9,
    "max_order_ratio": 1.1,
    "liquidation_check_interval_ms": 2000,
    "market_maker_refresh_interval_ms": 60 * 1000, // 1 minute
    "market_maker_id": "MARKET_MAKER",
}
    
export default config;
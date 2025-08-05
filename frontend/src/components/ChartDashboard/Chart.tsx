import { useEffect, useRef } from "react";

declare global {
	interface Window {
		TradingView: any; // or use the actual type if you have it
		Datafeeds: any;
	}
}

function Chart({ symbol }: { symbol: string }) {

	const bgColor = "#14151b";

	const chartRef = useRef<null | HTMLDivElement>(null);


	useEffect(() => {
		const widget = new window.TradingView.widget({
			container: chartRef.current,
			library_path: "/charting_library/",
			overrides: {
				"paneProperties.background": bgColor,
				"paneProperties.backgroundType": "solid",
			},

			autosize: true,
			symbol: symbol,
			interval: "1D",
			locale: "en",
			theme: "dark",
			custom_css_url: "/charting_library/Custom.css",

			// Optional: if using UDF-compatible backend
			datafeed: new window.Datafeeds.UDFCompatibleDatafeed("/api/chart"),
			disabled_features: [
				"symbol_search",
				"header_symbol_search",
				"header_compare",
				"header_saveload",
				"save_chart_properties_to_local_storage",
				"use_localstorage_for_settings",
			],
		});

		return () => widget.remove();
	}, [symbol]);

	return <div ref={chartRef} className="w-full h-full p-2"></div>;
}

export default Chart;

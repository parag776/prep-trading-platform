import { PositionWithContractPrice, SubscriptionMessage, WsResponse } from "@/lib/common/types";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useSocketSubscribe } from "./useSocketSubscribe";
import { getUpdatedPositions } from "../utils/positions";
import { SocketSubscribeContext } from "../context/SocketSubscribeContext";
import { getContractPriceFromResponse } from "../utils/misc";

export function usePositions(userId: string) {
	const [positions, setPositions] = useState<null | Array<PositionWithContractPrice>>(null);

	useSocketSubscribe("positions", "all", (response) => {
		if (response.channel === "positions") {
			setPositions((positions) => {
				return getUpdatedPositions(positions ?? [], response.message);
			});
		}
	});

	useEffect(() => {
		axios
			.get(`/api/positions`)
			.then(({ data }: { data: Array<PositionWithContractPrice> }) => {
				setPositions(data);
			})
			.catch(() => {
				throw new Error("positions fetching went wrong.");
			});
	}, [userId]);

	return positions;
}

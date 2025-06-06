import { PositionDiffResponse, PositionWithContractPrice } from "@/lib/common/types";
import { Position, Side } from "@/generated/prisma";

export function getUpdatedPositions(positions: Array<PositionWithContractPrice>, updates: Array<PositionDiffResponse> = []): Array<PositionWithContractPrice> {
	const positionMap = new Map<Position["id"], PositionWithContractPrice>();
	for (const position of positions) {
		positionMap.set(position.id, position);
	}
	for (const update of updates) {
		if (update.quantity === 0) {
			positionMap.delete(update.id);
		} else {
			positionMap.set(update.id, update);
		}
	}

	return Array.from(positionMap.values());
}

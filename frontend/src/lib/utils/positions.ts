import type { PositionDiffResponse } from "../../../../shared/types.mjs";
import type { Position } from "../../../../backend/src/generated/prisma";



export function getUpdatedPositions(positions: Array<Position>, updates: Array<PositionDiffResponse>) {
	const positionMap = new Map<Position["id"], Position>();
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

import { getNodeChain, StateTreeNode } from "@/types/game/position/StateTreeNode";
import PieceColour, { adaptPieceColour } from "@/constants/PieceColour";
import { getExpectedPointsLoss } from "./expectedPoints";
import {
    extractCurrentStateTreeNode,
    extractPreviousStateTreeNode
} from "./utils/extractNode";

export interface TurningPoint {
    node: StateTreeNode;
    /** Half-move number from the start of the game (1 = White's first). */
    ply: number;
    moveNumber: number;
    colour: PieceColour;
    /** Win chance given away by this move, from 0 to 100. */
    winChanceLost: number;
}

/**
 * @description Finds the moves on the main line that changed the game most,
 * meaning the ones that gave away the largest share of win chance. Uses only
 * the engine lines already on the tree, so it needs a finished analysis.
 */
export function getTurningPoints(
    rootNode: StateTreeNode,
    limit = 3,
    minWinChanceLost = 15
): TurningPoint[] {
    const candidates: TurningPoint[] = [];

    getNodeChain(rootNode).forEach((node, ply) => {
        if (!node.parent) return;

        try {
            const previous = extractPreviousStateTreeNode(node.parent);
            const current = extractCurrentStateTreeNode(node);
            if (!previous || !current) return;

            const colour = adaptPieceColour(current.playedMove.color);

            const winChanceLost = getExpectedPointsLoss(
                previous.evaluation,
                current.evaluation,
                colour
            ) * 100;

            if (winChanceLost < minWinChanceLost) return;

            candidates.push({
                node,
                ply,
                moveNumber: Math.ceil(ply / 2),
                colour,
                winChanceLost
            });
        } catch {
            // A node with incomplete data simply isn't a candidate
        }
    });

    return candidates
        .sort((a, b) => b.winChanceLost - a.winChanceLost)
        .slice(0, limit)
        .sort((a, b) => a.ply - b.ply);
}

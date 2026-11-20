import { maxBy } from "lodash-es";

import { StateTreeNode } from "@/types/game/position/StateTreeNode";
import { Classification } from "@/constants/Classification";
import { adaptPieceColour } from "@/constants/PieceColour";
import { pieceValues } from "@/constants/utils";
import {
    extractCurrentStateTreeNode,
    extractPreviousStateTreeNode
} from "./utils/extractNode";
import { getUnsafePieces } from "./utils/pieceSafety";

/**
 * A short reason for a move's classification. `key` picks the sentence
 * (translated by the UI); `piece` is a chess.js piece symbol (p, n, b, r, q).
 */
export interface MoveExplanation {
    key: string;
    params?: { piece?: string, moves?: number, pawns?: string };
}

const faultyClassifications = [
    Classification.INACCURACY,
    Classification.MISTAKE,
    Classification.BLUNDER
];

/**
 * @description Explains why a move was classified as it was, using only
 * the engine lines already on the state tree. Returns null when there is
 * nothing useful to say or data is missing.
 */
export function explainMove(node: StateTreeNode): MoveExplanation | null {
    const classification = node.state.classification;

    if (classification == Classification.BRILLIANT) return { key: "brilliant" };
    if (classification == Classification.CRITICAL) return { key: "critical" };

    if (!classification || !node.parent) return null;
    if (!faultyClassifications.includes(classification)) return null;

    try {
        const previous = extractPreviousStateTreeNode(node.parent);
        const current = extractCurrentStateTreeNode(node);
        if (!previous || !current) return null;

        const before = previous.subjectiveEvaluation;
        const after = current.subjectiveEvaluation;

        // The move allowed the opponent to force checkmate
        if (after.type == "mate" && after.value < 0)
            return { key: "allowsMate", params: { moves: Math.abs(after.value) } };

        // There was a forced checkmate, and it was not kept
        if (
            before?.type == "mate" && before.value > 0
            && !(after.type == "mate" && after.value > 0)
        ) return { key: "missedMate", params: { moves: before.value } };

        // The move left a piece that can be won for free or at a profit
        const colour = adaptPieceColour(current.playedMove.color);
        const unsafeBefore = getUnsafePieces(previous.board, colour);
        const unsafeAfter = getUnsafePieces(
            current.board, colour, current.playedMove
        );

        const hung = maxBy(unsafeAfter, piece => pieceValues[piece.type]);

        if (hung && unsafeAfter.length > unsafeBefore.length)
            return { key: "hungPiece", params: { piece: hung.type } };

        // The best move won material that the played move did not
        const bestCapture = previous.topMove.captured;

        if (
            bestCapture
            && !current.playedMove.captured
            && previous.topMove.san != current.playedMove.san
        ) return { key: "missedCapture", params: { piece: bestCapture } };

        // Otherwise, describe how much advantage was lost
        if (before?.type == "centipawn" && after.type == "centipawn") {
            const pawnsLost = (before.value - after.value) / 100;

            if (pawnsLost >= 0.3)
                return {
                    key: "evalDrop",
                    params: { pawns: pawnsLost.toFixed(1) }
                };
        }

        return { key: "betterExists" };
    } catch {
        return null;
    }
}

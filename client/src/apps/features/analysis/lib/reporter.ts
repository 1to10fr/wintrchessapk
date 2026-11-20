import { StatusCodes } from "http-status-codes";
import { clone } from "lodash-es";

import AnalysisOptions from "shared/lib/reporter/types/AnalysisOptions";
import { getGameAnalysis } from "shared/lib/reporter/report";
import {
    GameAnalysis,
    SerializedGameAnalysis
} from "shared/types/game/GameAnalysis";
import {
    StateTreeNode,
    serializeNode,
    deserializeNode
} from "shared/types/game/position/StateTreeNode";
import APIResponse from "@/types/APIResponse";

export async function analyseStateTree(
    rootNode: StateTreeNode,
    options?: AnalysisOptions
): APIResponse<{ gameAnalysis: GameAnalysis }> {
    // Classification runs locally (no server). Round-tripping through
    // serialize/deserialize gives getGameAnalysis a fresh, mutable tree,
    // exactly as the old server endpoint did.
    let serializedAnalysis: SerializedGameAnalysis;

    try {
        const gameAnalysis = getGameAnalysis(
            deserializeNode(serializeNode(rootNode)),
            options
        );

        serializedAnalysis = {
            ...gameAnalysis,
            stateTree: serializeNode(gameAnalysis.stateTree)
        };
    } catch {
        return { status: StatusCodes.INTERNAL_SERVER_ERROR };
    }

    return {
        status: StatusCodes.OK,
        gameAnalysis: {
            ...serializedAnalysis,
            stateTree: deserializeNode(
                serializedAnalysis.stateTree,
                rootNode
            )
        }
    };
}

export async function analyseNode(
    node: StateTreeNode,
    options?: AnalysisOptions
): APIResponse<{ node: StateTreeNode }> {
    if (!node.parent)
        return { status: StatusCodes.BAD_REQUEST };

    const childlessNode = clone(node);
    childlessNode.children = [];

    const parentNode = clone(node.parent);
    parentNode.children = [childlessNode];

    const reportResult = await analyseStateTree(parentNode, options);
    const analysedNode = reportResult.gameAnalysis?.stateTree.children.at(0);

    return {
        status: reportResult.status,
        node: analysedNode
    };
}
import React from "react";
import { useTranslation } from "react-i18next";

import PieceColour from "shared/constants/PieceColour";
import { getTurningPoints } from "shared/lib/reporter/turningPoints";
import useAnalysisGameStore from "@analysis/stores/AnalysisGameStore";
import useAnalysisBoardStore from "@analysis/stores/AnalysisBoardStore";

import * as styles from "./TurningPointsCard.module.css";

function TurningPointsCard() {
    const { t } = useTranslation("analysis");

    const analysisGame = useAnalysisGameStore(state => state.analysisGame);

    const setCurrentStateTreeNode = useAnalysisBoardStore(
        state => state.setCurrentStateTreeNode
    );

    const turningPoints = getTurningPoints(analysisGame.stateTree);

    if (turningPoints.length == 0) return null;

    return <div className={styles.wrapper}>
        <div className={styles.title}>
            {t("turningPointsCard.title")}
        </div>

        <div className={styles.points}>
            {turningPoints.map(point => <button
                key={point.node.id}
                className={styles.point}
                onClick={() => setCurrentStateTreeNode(point.node)}
            >
                <span className={styles.move}>
                    {point.moveNumber
                        + (point.colour == PieceColour.WHITE ? ". " : "... ")
                        + point.node.state.move?.san
                    }
                </span>

                <span className={styles.lost}>
                    {t("turningPointsCard.lost", {
                        colour: t("turningPointsCard.colours." + point.colour),
                        percent: Math.round(point.winChanceLost)
                    })}
                </span>
            </button>)}
        </div>
    </div>;
}

export default TurningPointsCard;

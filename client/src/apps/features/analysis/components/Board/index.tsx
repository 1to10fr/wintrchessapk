import React, { useMemo, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Piece, Square } from "react-chessboard/dist/chessboard/types";
import type { CustomPieces } from "react-chessboard/dist/chessboard/types";
import { Chess, Move, PieceSymbol } from "chess.js";
import { TouchBackend } from "react-dnd-touch-backend";

import { defaultRootNode } from "shared/constants/utils";
import { isMovePromotion } from "shared/lib/utils/chess";
import useResizeObserver from "@/hooks/useResizeObserver";
import PlayerProfile from "@/components/chess/PlayerProfile";
import EvaluationBar from "../EvaluationBar";

import { useSquares } from "./squares/useSquares";
import createSquareRenderer from "./squares/SquareRenderer";
import { SquaresContext } from "./squares/SquaresContext";

import BoardProps from "./BoardProps";
import * as styles from "./Board.module.css";

type ClickMove = Pick<Move, "from" | "to">;

// react-chessboard already switches to the touch backend on touch devices,
// but with zero slop: any finger jitter during a tap starts a drag, which
// makes taps unreliable. A small slop keeps taps as taps.
const isTouchDevice = typeof window != "undefined"
    && "ontouchstart" in window;

const pieceCodes: Piece[] = [
    "wP", "wN", "wB", "wR", "wQ", "wK",
    "bP", "bN", "bB", "bR", "bQ", "bK"
];

function buildCustomPieces(pieceSet: string): CustomPieces {
    const pieces: CustomPieces = {};

    for (const code of pieceCodes) {
        pieces[code] = ({ squareWidth }) => <img
            src={`/img/pieces/${pieceSet}/${code}.svg`}
            width={squareWidth}
            height={squareWidth}
            draggable={false}
            style={{ display: "block", pointerEvents: "none" }}
        />;
    }

    return pieces;
}

const touchBackendOptions = {
    enableTouchEvents: true,
    enableMouseEvents: true,
    touchSlop: 10,
    delayTouchStart: 0,
    ignoreContextMenu: true
};

function getPieceType(piece: Piece) {
    return piece.at(1)?.toLowerCase() as PieceSymbol;
}

function Board({
    className,
    style,
    profileClassName,
    profileStyle,
    whiteProfile,
    blackProfile,
    theme,
    piecesDraggable = true,
    node = defaultRootNode,
    flipped,
    evaluation,
    arrows,
    enableClassifications = true,
    onAddMove
}: BoardProps) {
    const squares = useSquares();

    const customPieces = useMemo(() => (
        theme?.pieceSet ? buildCustomPieces(theme.pieceSet) : undefined
    ), [theme?.pieceSet]);

    const renderStateRef = useRef({ node, enableClassifications });
    renderStateRef.current = { node, enableClassifications };

    const squareRenderer = useMemo(() => (
        createSquareRenderer(renderStateRef)
    ), []);

    const [ heldPromotion, setHeldPromotion ] = useState<ClickMove>();

    const boardContainerRef = useRef<HTMLDivElement | null>(null);
    const { fullWidth: boardWidth } = useResizeObserver(boardContainerRef, 1);

    const topProfile = flipped ? whiteProfile : blackProfile;
    const bottomProfile = flipped ? blackProfile : whiteProfile;

    function onSquareClick(square: Square, piece?: Piece) {
        squares.setHighlighted([]);

        const from = squares.selected;

        // Tapping a highlighted target plays the move and always clears the
        // selection afterwards, so stale dots never linger
        if (from && (
            squares.playable.includes(square)
            || squares.capturable.includes(square)
        )) {
            const selectedPiece = new Chess(node.state.fen).get(from);

            squares.setSelected(undefined);
            squares.clearPlayable();

            if (selectedPiece && isMovePromotion(selectedPiece.type, square)) {
                setHeldPromotion({ from, to: square });
                return;
            }

            addMove(from, square);
            return;
        }

        if (!piece || square == from) {
            squares.setSelected(undefined);
            squares.clearPlayable();
            return;
        }

        squares.setSelected(square);
        squares.loadPlayable(node.state.fen, square);
    }

    function onPromotionPieceSelect(
        piece?: Piece, from?: Square, to?: Square
    ) {
        // Always close the dialog, including when it is cancelled
        const held = heldPromotion;
        setHeldPromotion(undefined);

        if (!piece || !to) return false;

        const fromSquare = held?.from || from;
        if (!fromSquare) return false;
        
        return addMove(fromSquare, to, getPieceType(piece));
    }

    function addMove(
        from: Square, to: Square, promotion?: PieceSymbol,
        drop?: boolean
    ) {
        try {
            const move = new Chess(node.state.fen)
                .move({ from, to, promotion });

            squares.setPieceDropFlag(drop || false);

            return onAddMove?.(move) || true;
        } catch {
            return false;
        }
    }

    return <div
        className={`${styles.wrapper} ${className}`}
        style={style}
    >
        {topProfile && <div
            className={`${styles.profile} ${profileClassName}`}
            style={{ borderRadius: "7px 7px 0 0", ...profileStyle }}
        >
            <PlayerProfile profile={topProfile} />
        </div>}

        <div className={styles.boardContainer} ref={boardContainerRef}>
            {evaluation && <EvaluationBar
                evaluation={evaluation}
                moveColour={node.state.moveColour}
                flipped={flipped}
            />}

            <SquaresContext.Provider value={squares}>
                <Chessboard
                    position={node.state.fen}
                    boardOrientation={flipped ? "black" : "white"}
                    onSquareClick={onSquareClick}
                    onSquareRightClick={squares.toggleHighlight}
                    onPieceDragBegin={(piece, square) => {
                        squares.setSelected(square);
                        squares.loadPlayable(node.state.fen, square);
                    }}
                    onPieceDrop={(from, to, piece) => {
                        squares.setSelected(undefined);
                        squares.clearPlayable();

                        return addMove(from, to, getPieceType(piece), true);
                    }}
                    onPromotionPieceSelect={onPromotionPieceSelect}
                    customDndBackend={isTouchDevice ? TouchBackend : undefined}
                    customDndBackendOptions={isTouchDevice
                        ? touchBackendOptions
                        : undefined
                    }
                    customSquare={squareRenderer}
                    customPieces={customPieces}
                    showBoardNotation={theme?.showCoordinates ?? true}
                    customArrows={arrows}
                    arePiecesDraggable={piecesDraggable}
                    customLightSquareStyle={theme?.lightSquareColour
                        ? { backgroundColor: theme.lightSquareColour }
                        : undefined
                    }
                    customDarkSquareStyle={theme?.darkSquareColour
                        ? { backgroundColor: theme.darkSquareColour }
                        : undefined
                    }
                    animationDuration={100}
                    showPromotionDialog={!!heldPromotion}
                    promotionToSquare={heldPromotion?.to}
                    promotionDialogVariant="vertical"
                    boardWidth={boardWidth - (evaluation ? 40 : 0)}
                />
            </SquaresContext.Provider>
        </div>

        {bottomProfile && <div
            className={`${styles.profile} ${profileClassName}`}
            style={{ borderRadius: "0 0 7px 7px", ...profileStyle }}
        >
            <PlayerProfile profile={bottomProfile} />
        </div>}
    </div>;
}

export default Board;
import { Chess } from "chess.js";

import { StateTreeNode } from "shared/types/game/position/StateTreeNode";
import { parseSanMove } from "shared/lib/utils/chess";

import iconMove from "@assets/audio/move.mp3";
import iconCheck from "@assets/audio/check.mp3";
import iconCapture from "@assets/audio/capture.mp3";
import iconCastle from "@assets/audio/castle.mp3";
import iconPromote from "@assets/audio/promote.mp3";
import iconGameend from "@assets/audio/gameend.mp3";

const moveSounds = {
    move: iconMove,
    check: iconCheck,
    capture: iconCapture,
    castle: iconCastle,
    promote: iconPromote,
    gameEnd: iconGameend
};

// Creating and decoding a new Audio element per move is slow on mobile
// WebViews and stutters the piece animation, so each sound is loaded once.
const audioCache: Partial<Record<keyof typeof moveSounds, HTMLAudioElement>> = {};

function play(name: keyof typeof moveSounds) {
    let audio = audioCache[name];

    if (!audio) {
        audio = new Audio(moveSounds[name]);
        audio.preload = "auto";
        audioCache[name] = audio;
    }

    audio.currentTime = 0;
    audio.play().catch(() => {});
}

if (typeof Audio != "undefined") {
    (Object.keys(moveSounds) as (keyof typeof moveSounds)[])
        .forEach(name => {
            const audio = new Audio(moveSounds[name]);
            audio.preload = "auto";
            audioCache[name] = audio;
        });
}

function playBoardSound(node: StateTreeNode) {
    const move = node.state.move;
    if (!move) return;

    const board = new Chess(node.state.fen);

    if (board.isGameOver()) {
        play("gameEnd");
    }

    const parsedMove = parseSanMove(move.san);

    if (parsedMove.check || parsedMove.checkmate) {
        play("check");
    } else if (parsedMove.castling) {
        play("castle");
    } else if (parsedMove.promotion) {
        play("promote");
    } else if (parsedMove.capture) {
        play("capture");
    } else {
        play("move");
    }
}

export default playBoardSound;
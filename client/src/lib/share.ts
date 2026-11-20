import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Chess } from "chess.js";

const SQUARE_SIZE = 80;

// The default board pieces are drawn by the board library, so exported
// images use the closest bundled set instead
const FALLBACK_PIECE_SET = "cburnett";

function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

async function shareNativeFile(
    filename: string,
    data: string,
    encoding: "utf8" | "base64",
    title: string
) {
    const { uri } = await Filesystem.writeFile({
        path: filename,
        data,
        directory: Directory.Cache,
        ...(encoding == "utf8" ? { encoding: Encoding.UTF8 } : {})
    });

    await Share.share({ title, dialogTitle: title, files: [ uri ] });
}

export async function sharePgn(pgn: string, title: string) {
    if (Capacitor.isNativePlatform()) {
        try {
            await shareNativeFile("game.pgn", pgn, "utf8", title);
        } catch {
            await Share.share({ title, text: pgn, dialogTitle: title });
        }

        return;
    }

    if (navigator.share) {
        try {
            await navigator.share({ title, text: pgn });
            return;
        } catch {
            // Fall through to a download if sharing is cancelled or refused
        }
    }

    downloadBlob(new Blob([ pgn ], { type: "application/x-chess-pgn" }), "game.pgn");
}

function loadImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Failed to load ${src}`));
        image.src = src;
    });
}

export async function renderBoardImage(
    fen: string,
    lightColour: string,
    darkColour: string,
    pieceSet: string
) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = SQUARE_SIZE * 8;

    const context = canvas.getContext("2d")!;

    const board = new Chess(fen).board();
    const set = pieceSet || FALLBACK_PIECE_SET;

    const images = new Map<string, HTMLImageElement>();

    for (const piece of board.flat()) {
        if (!piece) continue;

        const code = piece.color + piece.type.toUpperCase();
        if (images.has(code)) continue;

        images.set(code, await loadImage(`/img/pieces/${set}/${code}.svg`));
    }

    board.forEach((row, rank) => row.forEach((piece, file) => {
        context.fillStyle = (rank + file) % 2 == 0 ? lightColour : darkColour;
        context.fillRect(
            file * SQUARE_SIZE, rank * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE
        );

        if (!piece) return;

        context.drawImage(
            images.get(piece.color + piece.type.toUpperCase())!,
            file * SQUARE_SIZE, rank * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE
        );
    }));

    return canvas.toDataURL("image/png");
}

export async function shareBoardImage(dataUrl: string, title: string) {
    if (Capacitor.isNativePlatform()) {
        await shareNativeFile(
            "position.png", dataUrl.split(",")[1], "base64", title
        );

        return;
    }

    const blob = await (await fetch(dataUrl)).blob();

    if (navigator.canShare?.({ files: [ new File([ blob ], "position.png") ] })) {
        try {
            await navigator.share({
                title,
                files: [ new File([ blob ], "position.png", { type: "image/png" }) ]
            });
            return;
        } catch {
            // Fall through to a download
        }
    }

    downloadBlob(blob, "position.png");
}

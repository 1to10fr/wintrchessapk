export interface Release {
    version: string;
    date?: string;
    changes: { type: "new" | "improved" | "fixed", text: string }[];
}

// Newest first. Add an entry here (and bump android-app/VERSION) per release.
const releases: Release[] = [
    {
        version: "1.1.1",
        date: "2026-11-20",
        changes: [
            { type: "new", text: "This What's New page, replacing the empty News tab" },
            { type: "fixed", text: "Terms and Privacy links in the footer open correctly" }
        ]
    },
    {
        version: "1.1.0",
        date: "2026-11-20",
        changes: [
            { type: "new", text: "App themes: Dark, Light and AMOLED black, plus a custom accent colour" },
            { type: "new", text: "Six piece sets to choose from: Classic, Merida, Mono, Chessnut, Fantasy and Pixel" },
            { type: "new", text: "Seven new board colour themes" },
            { type: "new", text: "Board options: show or hide coordinates, and choose the last-move highlight and engine arrow colours" },
            { type: "new", text: "Vibration on moves, captures and checks, with a switch in Settings" },
            { type: "new", text: "Share a game as a PGN file or a position as an image" },
            { type: "improved", text: "Taps and drags on the board are far more reliable" },
            { type: "improved", text: "Piece movement and engine analysis feel smoother" },
            { type: "improved", text: "Importing a PGN file works with .txt files on Android" },
            { type: "fixed", text: "Settings no longer sends you back to the analysis page" },
            { type: "fixed", text: "Black pieces and the evaluation bar are no longer recoloured by Android's dark mode" },
            { type: "fixed", text: "Scrolling the analysis panel no longer selects moves by accident" }
        ]
    },
    {
        version: "1.0.4 and earlier",
        changes: [
            { type: "new", text: "Game analysis with Stockfish, with move classifications and an evaluation graph" },
            { type: "new", text: "Import games from a PGN, chess.com or lichess" }
        ]
    }
];

export default releases;

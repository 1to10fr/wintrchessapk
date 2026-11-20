import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import useSettingsStore, { defaultSettings } from "@/stores/SettingsStore";
import BoardColourPreset from "@/apps/settings/components/BoardColourPreset";
import ColourSwatch from "@/components/settings/ColourSwatch";
import Button from "@/components/common/Button";
import Separator from "@/components/common/Separator";
import SwitchSetting from "@/components/settings/SwitchSetting";
import { DEFAULT_ACCENT } from "@/lib/appTheme";
import type { AppTheme } from "@/lib/appTheme";

import * as categoryStyles from "../Category.module.css";
import * as styles from "./BoardAndPieces.module.css";

import iconInterfaceDelete from "@assets/img/interface/delete.svg";

const boardColourPresets = [
    { light: "#f0d9b5", dark: "#b58863", name: "wooden" },
    { light: "#ebedd1", dark: "#729452", name: "tournament" },
    { light: "#eae8d3", dark: "#4b7298", name: "blue" },
    { light: "#d9e4e8", dark: "#83a5b6", name: "ice" },
    { light: "#f5f1f0", dark: "#f8c8dc", name: "marshmallow" },
    { light: "#b6b8e1", dark: "#9c9fd9", name: "pillow" },
    { light: "#aab4c8", dark: "#3b4663", name: "midnight" },
    { light: "#f7e4d6", dark: "#d98a6c", name: "coral" },
    { light: "#e6e8d5", dark: "#4e6e50", name: "forest" },
    { light: "#e8dff5", dark: "#8b6fb8", name: "lavender" },
    { light: "#d4d9de", dark: "#66727f", name: "slate" },
    { light: "#f3e7c9", dark: "#c99a5b", name: "desert" },
    { light: "#e4f2ea", dark: "#6fae93", name: "mint" }
];

const appThemes: { key: AppTheme, label: string }[] = [
    { key: "dark", label: "Dark" },
    { key: "light", label: "Light" },
    { key: "amoled", label: "AMOLED" }
];

const accentColours = [
    "#467de8", "#8b5cf6", "#ec4899", "#ef4444",
    "#f59e0b", "#10b981", "#14b8a6", "#64748b"
];

const pieceSets = [
    { key: "", label: "Default", preview: "/img/pieces/standard/white_king.svg" },
    { key: "cburnett", label: "Classic" },
    { key: "merida", label: "Merida" },
    { key: "mono", label: "Mono" },
    { key: "chessnut", label: "Chessnut" },
    { key: "fantasy", label: "Fantasy" },
    { key: "pixel", label: "Pixel" }
];

function BoardAndPieces() {
    const { t } = useTranslation(["settings", "common"]);

    const { settings, setSettings } = useSettingsStore();

    const [
        lightSquareColourSwatchOpen,
        setLightSquareColourSwatchOpen
    ] = useState(false);

    const [
        darkSquareColourSwatchOpen,
        setDarkSquareColourSwatchOpen
    ] = useState(false);

    const [ openSwatch, setOpenSwatch ] = useState<string | null>(null);

    function setTheme(update: (themes: typeof settings.themes) => void) {
        setSettings(draft => {
            update(draft.themes);
            return draft;
        });
    }

    function setBoardColours(light: string, dark: string) {
        setSettings(draft => {
            draft.themes.board.lightSquareColour = light;
            draft.themes.board.darkSquareColour = dark;

            return draft;
        });
    }

    return <div
        className={categoryStyles.wrapper}
        onClick={event => {
            setLightSquareColourSwatchOpen(false);
            setDarkSquareColourSwatchOpen(false);
            setOpenSwatch(null);

            event.stopPropagation();
        }}
    >
        <b className={categoryStyles.header}>
            {t("boardAndPieces.appTheme", { defaultValue: "App Theme" })}
        </b>

        <Separator className={categoryStyles.separator} />

        <div className={styles.chips}>
            {appThemes.map(appTheme => <div
                key={appTheme.key}
                className={
                    styles.chip
                    + (settings.themes.app == appTheme.key
                        ? ` ${styles.chipSelected}` : "")
                }
                onClick={() => setTheme(themes => {
                    themes.app = appTheme.key;
                })}
            >
                {appTheme.label}
            </div>)}
        </div>

        <div className={categoryStyles.setting}>
            <span>
                {t("boardAndPieces.accentColour", {
                    defaultValue: "Accent Colour"
                })}
            </span>

            <ColourSwatch
                colour={settings.themes.accent}
                onColourChange={colour => setTheme(themes => {
                    themes.accent = colour;
                })}
                open={openSwatch == "accent"}
                onToggle={open => setOpenSwatch(open ? "accent" : null)}
            />
        </div>

        <div className={styles.dots}>
            {accentColours.map(colour => <div
                key={colour}
                className={
                    styles.dot
                    + (settings.themes.accent == colour
                        ? ` ${styles.dotSelected}` : "")
                }
                style={{ backgroundColor: colour }}
                onClick={() => setTheme(themes => {
                    themes.accent = colour;
                })}
            />)}
        </div>

        <b className={categoryStyles.header}>
            {t("boardAndPieces.boardColour")}
        </b>

        <Separator className={categoryStyles.separator} />

        <div className={categoryStyles.setting}>
            <span>
                {t("boardAndPieces.lightSquareColour")}
            </span>

            <ColourSwatch
                colour={settings.themes.board.lightSquareColour}
                onColourChange={colour => {
                    setSettings(draft => {
                        draft.themes.board.lightSquareColour = colour;
                        return draft;
                    });
                }}
                open={lightSquareColourSwatchOpen}
                onToggle={setLightSquareColourSwatchOpen}
            />
        </div>

        <div className={categoryStyles.setting}>
            <span>
                {t("boardAndPieces.darkSquareColour")}
            </span>

            <ColourSwatch
                colour={settings.themes.board.darkSquareColour}
                onColourChange={colour => {
                    setSettings(draft => {
                        draft.themes.board.darkSquareColour = colour;
                        return draft;
                    });
                }}
                open={darkSquareColourSwatchOpen}
                onToggle={setDarkSquareColourSwatchOpen}
            />
        </div>

        <Button
            icon={iconInterfaceDelete}
            onClick={() => setBoardColours(
                defaultSettings.themes.board.lightSquareColour,
                defaultSettings.themes.board.darkSquareColour
            )}
        >
            {t("reset", { ns: "common" })}
        </Button>

        <b className={categoryStyles.subheader}>
            {t("boardAndPieces.presetsTitle")}
        </b>

        <div className={styles.presets}>
            {boardColourPresets.map(preset => <BoardColourPreset
                key={preset.name}
                lightSquareColour={preset.light}
                darkSquareColour={preset.dark}
                title={t(
                    `boardAndPieces.presets.${preset.name}`
                )}
                selected={
                    settings.themes.board.lightSquareColour == preset.light
                    && settings.themes.board.darkSquareColour == preset.dark
                }
                onClick={() => setBoardColours(preset.light, preset.dark)}
            />)}
        </div>

        <b className={categoryStyles.header}>
            {t("boardAndPieces.pieceSet", { defaultValue: "Piece Set" })}
        </b>

        <Separator className={categoryStyles.separator} />

        <div className={styles.pieceOptions}>
            {pieceSets.map(pieceSet => <div
                key={pieceSet.key}
                className={
                    styles.pieceOption
                    + (settings.themes.piece == pieceSet.key
                        ? ` ${styles.pieceOptionSelected}` : "")
                }
                onClick={() => setTheme(themes => {
                    themes.piece = pieceSet.key;
                })}
            >
                <img
                    src={pieceSet.preview
                        || `/img/pieces/${pieceSet.key}/wN.svg`}
                />

                <span>{pieceSet.label}</span>
            </div>)}
        </div>

        <b className={categoryStyles.header}>
            {t("boardAndPieces.boardExtras", {
                defaultValue: "Board Extras"
            })}
        </b>

        <Separator className={categoryStyles.separator} />

        <div className={categoryStyles.setting}>
            <span>
                {t("boardAndPieces.showCoordinates", {
                    defaultValue: "Show Coordinates"
                })}
            </span>

            <SwitchSetting
                defaultChecked={settings.themes.board.showCoordinates}
                onChange={checked => setTheme(themes => {
                    themes.board.showCoordinates = checked;
                })}
            />
        </div>

        <div className={categoryStyles.setting}>
            <span>
                {t("boardAndPieces.lastMoveColour", {
                    defaultValue: "Last Move Highlight"
                })}
            </span>

            <ColourSwatch
                colour={settings.themes.board.lastMoveColour || "#ffff33"}
                onColourChange={colour => setTheme(themes => {
                    themes.board.lastMoveColour = colour;
                })}
                open={openSwatch == "lastMove"}
                onToggle={open => setOpenSwatch(open ? "lastMove" : null)}
            />
        </div>

        <div className={categoryStyles.setting}>
            <span>
                {t("boardAndPieces.arrowColour", {
                    defaultValue: "Engine Arrow Colour"
                })}
            </span>

            <ColourSwatch
                colour={settings.themes.board.arrowColour || "#81b64c"}
                onColourChange={colour => setTheme(themes => {
                    themes.board.arrowColour = colour;
                })}
                open={openSwatch == "arrow"}
                onToggle={open => setOpenSwatch(open ? "arrow" : null)}
            />
        </div>

        <Button
            icon={iconInterfaceDelete}
            onClick={() => setTheme(themes => {
                themes.app = "dark";
                themes.accent = DEFAULT_ACCENT;
                themes.piece = "";
                themes.board.lastMoveColour = "";
                themes.board.arrowColour = "";
                themes.board.showCoordinates = true;
            })}
        >
            {t("reset", { ns: "common" })}
        </Button>

        <b className={categoryStyles.header}>
            {t("boardAndPieces.feel", { defaultValue: "Feel" })}
        </b>

        <Separator className={categoryStyles.separator} />

        <div className={categoryStyles.setting}>
            <span>
                {t("boardAndPieces.haptics", {
                    defaultValue: "Vibrate on Moves"
                })}
            </span>

            <SwitchSetting
                defaultChecked={settings.haptics}
                onChange={checked => setSettings(draft => {
                    draft.haptics = checked;
                    return draft;
                })}
            />
        </div>
    </div>;
}

export default BoardAndPieces;
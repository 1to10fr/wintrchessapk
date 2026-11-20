import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import renderStateTree from "shared/lib/stateTree/render";
import Dialog from "@/components/common/Dialog";
import TextField from "@/components/common/TextField";
import Button from "@/components/common/Button";
import useSettingsStore from "@/stores/SettingsStore";
import { sharePgn, renderBoardImage, shareBoardImage } from "@/lib/share";

import ShareDialogProps from "./ShareDialogProps";
import * as styles from "./ShareDialog.module.css";

function ShareDialog({ game, currentNode, onClose }: ShareDialogProps) {
    const { t } = useTranslation(["common", "analysis"]);

    const [ sharing, setSharing ] = useState(false);

    async function share(action: () => Promise<void>) {
        setSharing(true);

        try {
            await action();
        } catch {
            // The user closing the share sheet is not an error worth showing
        }

        setSharing(false);
    }

    function shareImage() {
        const { board, piece } = useSettingsStore.getState().settings.themes;

        return share(async () => {
            const image = await renderBoardImage(
                currentNode.state.fen,
                board.lightSquareColour,
                board.darkSquareColour,
                piece
            );

            await shareBoardImage(image, "Chess position");
        });
    }

    return <Dialog className={styles.wrapper} onClose={onClose}>
        <div className={styles.title}>
            {t("optionsToolbar.share", { ns: "analysis" })}
        </div>

        <div className={styles.content}>
            <div className={styles.section}>
                <span>
                    {t("shareGame.shareHeader", { defaultValue: "Share" })}
                </span>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <Button
                        disabled={sharing}
                        onClick={() => share(() => sharePgn(
                            renderStateTree(game.stateTree, game),
                            "Chess game"
                        ))}
                    >
                        {t("shareGame.sharePGN", {
                            defaultValue: "Share PGN"
                        })}
                    </Button>

                    <Button disabled={sharing} onClick={shareImage}>
                        {t("shareGame.shareImage", {
                            defaultValue: "Share Board Image"
                        })}
                    </Button>
                </div>
            </div>

            <div className={styles.section}>
                <span>FEN</span>

                <TextField
                    wrapperStyle={{ width: "100%" }}
                    className={styles.field}
                    copyClassName={styles.fieldCopy}
                    value={currentNode.state.fen}
                    readOnly
                    copyable
                    copyTooltip={t("shareGame.copyFEN")}
                    copyToast={t("shareGame.copyFENToast")}
                    onClick={event => event.currentTarget.select()}
                />
            </div>

            <div className={styles.section}>
                <span>PGN</span>

                <TextField
                    wrapperStyle={{ width: "100%", height: "300px" }}
                    className={styles.field}
                    copyClassName={styles.areaFieldCopy}
                    value={renderStateTree(game.stateTree, game)}
                    multiline
                    readOnly
                    copyable
                    copyTooltip={t("shareGame.copyPGN")}
                    copyToast={t("shareGame.copyPGNToast")}
                    onClick={event => event.currentTarget.select()}
                />
            </div>
        </div>
    </Dialog>;
}

export default ShareDialog;
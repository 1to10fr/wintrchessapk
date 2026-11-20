import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";

import PageWrapper from "@/components/layout/PageWrapper";
import { removeDefaultConsentLink } from "@/lib/consent";

import releases from "./releases";

import "@/i18n";
import "@/index.css";

import * as styles from "./changelog.module.css";

const labels = {
    new: "New",
    improved: "Improved",
    fixed: "Fixed"
};

const root = ReactDOM.createRoot(
    document.querySelector(".root")!
);

function App() {
    useEffect(() => {
        removeDefaultConsentLink();
    }, []);

    return <PageWrapper>
        <div className={styles.wrapper}>
            <h1 className={styles.title}>What's New</h1>

            {releases.map(release => <section
                key={release.version}
                className={styles.release}
            >
                <div className={styles.header}>
                    <b className={styles.version}>
                        {/^\d/.test(release.version) && release.version.length < 8
                            ? `v${release.version}`
                            : release.version}
                    </b>

                    {release.date && <span className={styles.date}>
                        {release.date}
                    </span>}
                </div>

                <ul className={styles.changes}>
                    {release.changes.map(change => <li key={change.text}>
                        <span className={`${styles.tag} ${styles[change.type]}`}>
                            {labels[change.type]}
                        </span>

                        <span>{change.text}</span>
                    </li>)}
                </ul>
            </section>)}
        </div>
    </PageWrapper>;
}

root.render(<App/>);

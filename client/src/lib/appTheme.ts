export type AppTheme = "dark" | "light" | "amoled";

export const DEFAULT_ACCENT = "#467de8";

// Dark is the stylesheet default, so it needs no overrides
const overrides: Record<AppTheme, Record<string, string>> = {
    dark: {},
    amoled: {
        "--ui-shade-1": "#000000",
        "--ui-shade-2": "#050506",
        "--ui-shade-3": "#0d0e10",
        "--ui-shade-4": "#17181b",
        "--ui-shade-5": "#222427",
        "--ui-shade-6": "#26292d",
        "--ui-shade-7": "#363a40"
    },
    light: {
        "--ui-shade-1": "#e4e8ee",
        "--ui-shade-2": "#eef1f5",
        "--ui-shade-3": "#f8f9fb",
        "--ui-shade-4": "#e1e5ea",
        "--ui-shade-5": "#d3d8df",
        "--ui-shade-6": "#cbd1d9",
        "--ui-shade-7": "#b6bdc7",
        "--ui-text": "#16181d",
        "--ui-text-soft": "#3a3f47",
        "--ui-text-muted": "rgba(22, 24, 29, 0.55)"
    }
};

export function applyAppTheme(theme: AppTheme, accent: string) {
    if (typeof document == "undefined") return;

    const root = document.documentElement;

    for (const props of Object.values(overrides)) {
        for (const name of Object.keys(props)) root.style.removeProperty(name);
    }

    for (const [name, value] of Object.entries(overrides[theme] || {})) {
        root.style.setProperty(name, value);
    }

    root.style.setProperty("--ui-blue", accent || DEFAULT_ACCENT);
    root.style.colorScheme = theme == "light" ? "light" : "dark";

    document.querySelector("meta[name=\"theme-color\"]")
        ?.setAttribute("content", accent || DEFAULT_ACCENT);
}

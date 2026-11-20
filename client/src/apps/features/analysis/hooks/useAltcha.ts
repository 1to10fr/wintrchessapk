// Analysis now runs fully in the browser, so there is no server session or
// CAPTCHA to solve. This no-op keeps existing callers working unchanged.
export function useAltcha() {
    return async function execute() {};
}

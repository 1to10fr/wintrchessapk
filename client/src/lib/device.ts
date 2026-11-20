// Tiny module using a SIMD instruction; validates only if SIMD is supported
const SIMD_TEST_MODULE = new Uint8Array([
    0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0,
    10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11
]);

/** The Stockfish wasm builds need WebAssembly SIMD; asm.js does not. */
export function supportsWasmSimd() {
    try {
        return typeof WebAssembly == "object"
            && WebAssembly.validate(SIMD_TEST_MODULE);
    } catch {
        return false;
    }
}

type DeviceTier = "low" | "mid" | "high";

/** Rough speed class from CPU cores, memory and engine capability. */
export function getDeviceTier(): DeviceTier {
    const cores = navigator.hardwareConcurrency || 2;
    const memory = (navigator as { deviceMemory?: number }).deviceMemory ?? 4;

    if (!supportsWasmSimd() || cores <= 2 || memory <= 2) return "low";
    if (cores <= 4 || memory <= 4) return "mid";
    return "high";
}

/** Engine search defaults per tier: slow devices get a shallower search. */
export const ENGINE_PRESETS: Record<
    DeviceTier, { depth: number, lines: number }
> = {
    low: { depth: 10, lines: 1 },
    mid: { depth: 14, lines: 2 },
    high: { depth: 16, lines: 2 }
};

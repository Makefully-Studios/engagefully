/**
 * Quantize a 2D stick vector into equal angular sectors.
 *
 * Screen convention: +x right, +y down. Sector 0 is screen-forward (-y)
 * when `forward` is `'-y'` (default).
 *
 * @param {number} x
 * @param {number} y
 * @param {{ sectors?: number, deadzone?: number, forward?: '-y' | '+y' }} [options]
 * @returns {{ sector: number } | null}
 */
export function quantizeStick (x, y, options = {}) {
    const sectors = options.sectors ?? 8;
    const deadzone = options.deadzone ?? 0.35;
    const forward = options.forward ?? '-y';

    const mag = Math.hypot(x, y);
    if (mag < deadzone || sectors < 1) return null;

    const fy = forward === '+y' ? y : -y;
    const angle = Math.atan2(x, fy);
    const sector = Math.round(angle / (Math.PI * 2 / sectors));
    return { sector: ((sector % sectors) + sectors) % sectors };
}

export default quantizeStick;

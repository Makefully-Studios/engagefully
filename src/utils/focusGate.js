/**
 * Build an `enabled` predicate for ActionMap that returns false while the
 * user is typing in an editable field (or when `extra()` is true).
 *
 * @param {{ extra?: () => boolean }} [options]
 * @returns {() => boolean}
 */
export function focusGate (options = {}) {
    const extra = typeof options.extra === 'function' ? options.extra : () => false;

    return () => {
        if (extra()) return false;
        const el = typeof document !== 'undefined' ? document.activeElement : null;
        if (!el || el === document.body) return true;
        const tag = el.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return false;
        if (el.isContentEditable) return false;
        return true;
    };
}

export default focusGate;

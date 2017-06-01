const fps = 29.97;

export function framesToSeconds(frames) {
    return frames / fps;
}

export function formatSeconds(seconds) {
    return (new Date(seconds * 1000)).toISOString().substr(14, 5);
}

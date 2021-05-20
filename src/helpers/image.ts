export  function makePreviewFileName(fileName: string) {
    const ext = fileName.match(/\.[^/.]+$/);
    return fileName.replace(/\.[^/.]+$/, `_preview${ext}`);
}

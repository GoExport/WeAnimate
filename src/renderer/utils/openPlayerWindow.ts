export default function openPlayerWindow(movieId: string) {
    const isWideRaw = localStorage.getItem("isWide_active");
    const isWide = isWideRaw === null ? true : (isWideRaw === "true" || isWideRaw === "1");

    let width = Math.floor(screen.availWidth * (2 / 3));
    
    const videoHeight = isWide 
        ? Math.floor(width / (16 / 9)) 
        : Math.floor(width / (14 / 9));

    let height = videoHeight + 1;

    const isWindows = (typeof process !== 'undefined' && process.platform === 'win32') || 
                      (navigator.platform.indexOf('Win') !== -1);

    if (isWindows) {
        width += 4;

        if (isWide) {
            height += 62; 
        } else {
            height += 62; 
        }
    }

    const left = Math.floor((screen.availWidth - width) / 2);
    const top = Math.floor((screen.availHeight - height) / 2);

    window.open(
        `?redirect=/movies/play/${movieId}`,
        "Video player - Wrapper offline",
        `width=${width},height=${height},left=${left},top=${top},menubar=no,status=no,resizable=no`
    );
}

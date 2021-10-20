/**
 * Creates a relative path from a host file to a target file which is located in the root.
 * @example `modules/_index_.html` --> `../favicon.ico`
 * @param hostPath The path of the file which will contain the resulting relative path.
 * @param targetFilename The name of the target file.
 */
export function makeRelativeToRoot(hostPath: string, targetFilename: string): string {
    // Find separators.
    const match = hostPath.match(/[/\\]/g);
    if (!match) return targetFilename;

    // Create path with one '../' per separator and targetFilename at the end.
    const separatorCount = match.length;
    const parts = [...Array(separatorCount).fill('..'), targetFilename];
    return parts.join('/');
}

/**
 * Appends a favicon link at the end of `<head>` in the given html.
 * @param html HTML string to append to.
 * @param url URL of the favicon.
 */
export function appendFavicon(html: string, url: string): string {
    return html.replace('</head>',
        '\t' + // Some tabulation to fit the rest of the document.
        `<link rel="icon" href="${url}" />` +
        '\n' + // Push the end of <head> to the next line.
        '</head>'
    );
}

/**
 * Appends a string value after "Generated using TypeDoc".
 * @param html HTML string to append to.
 * @param value A string value.
 */
export function appendToFooter(html: string, value: string): string {
    return html.replace(/(<p>Generated using.*TypeDoc.*)(<\/p>)/,
        '$1' + // Start of <p>
        value +
        '$2' // End of <p>
    );
}

export function isUrl(url: string): boolean {
    return /^https?\/\//i.test(url);
}

import { RendererComponent } from 'typedoc/dist/lib/output/components';
import { PageEvent } from 'typedoc/dist/lib/output/events';
import { basename } from 'path';

/**
 * Creates a relative path from a host file to a target file which is located in the root.
 * @example `modules/_index_.html` --> `../favicon.ico`
 * @param hostPath The path of the file which will contain the resulting relative path.
 * @param targetFilename The name of the target file.
 */
function makeRelativeToRoot(hostPath: string, targetFilename: string): string {
    // Find separators.
    const match = hostPath.match(/[/\\]/g);
    if (!match) return targetFilename;

    // Create path with one '../' per separator and targetFilename at the end.
    const separatorCount = match.length;
    const parts = [...Array(separatorCount).fill('..'), targetFilename];
    return parts.join('/');
}

export class ExtrasPlugin extends RendererComponent {

    initialize() {
        this.listenTo(this.owner, PageEvent.END, this.onRendererEndPage);
    }

    private onRendererEndPage(page: PageEvent) {
        const noFavicon = this.application.options.getValue('noFavicon') as boolean;
        const favicon = basename(this.application.options.getValue('favicon') as string);
        const hideDate = this.application.options.getValue('hideDate') as boolean;
        const hideTime = this.application.options.getValue('hideTime') as boolean;

        // Add icon.
        if (!noFavicon) {
            const faviconUrl = makeRelativeToRoot(page.url, favicon);
            page.contents = page.contents.replace('</head>',
                '\t' +
                `<link rel="icon" href="${faviconUrl}" />` +
                '\n' +
                '</head>');
        }

        // Add generation date and/or time.
        if (!this.application.options.getValue('hideGenerator') && (!hideDate || !hideTime)) {
            const now = new Date();
            const date = ` the ${now.toLocaleDateString()}`
            const time = ` at ${now.toLocaleTimeString()}`;

            let appended = ',';
            if (!hideDate) appended += date;
            if (!hideTime) appended += time;

            page.contents = page.contents.replace(/(<p>Generated using.*TypeDoc.*)(<\/p>)/,
                '$1' +      // Start of <p>
                appended +  // Date and/or time
                '$2');      // End of <p>
        }
    }
}

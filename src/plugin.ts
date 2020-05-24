import { RendererComponent } from 'typedoc/dist/lib/output/components';
import { PageEvent } from 'typedoc/dist/lib/output/events';
import { JSDOM } from 'jsdom';
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
        const dom = new JSDOM(page.contents);
        const document = dom.window.document;

        const noFavicon = this.application.options.getValue('noFavicon') as boolean;
        const favicon = basename(this.application.options.getValue('favicon') as string);
        const hideDate = this.application.options.getValue('hideDate') as boolean;
        const hideTime = this.application.options.getValue('hideTime') as boolean;

        // Add icon.
        if (!noFavicon) {
            const head = document.querySelector('head');
            const faviconUrl = makeRelativeToRoot(page.url, favicon);
            head.innerHTML += `<link rel="icon" href="${faviconUrl}" />`;
        }

        // Add generation date and/or time.
        if (!this.application.options.getValue('hideGenerator') && (!hideDate || !hideTime)) {
            const p = document.querySelector('body > div.container.tsd-generator > p');
            const now = new Date();
            const date = ` the ${now.toLocaleDateString()}`
            const time = ` at ${now.toLocaleTimeString()}`;

            p.innerHTML += ',';
            if (!hideDate) p.innerHTML += date;
            if (!hideTime) p.innerHTML += time;
        }

        page.contents = dom.serialize();
    }
}

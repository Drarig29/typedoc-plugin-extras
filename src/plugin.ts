import { makeRelativeToRoot, appendFavicon, appendToFooter } from './helpers';
import { RendererComponent } from 'typedoc/dist/lib/output/components';
import { PageEvent } from 'typedoc/dist/lib/output/events';
import { basename } from 'path';

const TYPEDOC_VERSION = require('typedoc/package.json').version;

export class ExtrasPlugin extends RendererComponent {

    initialize() {
        this.listenTo(this.owner, PageEvent.END, this.onRendererEndPage);
    }

    private onRendererEndPage(page: PageEvent) {
        if (!page.contents)
            return

        const favicon = basename(this.application.options.getValue('favicon') as string);
        const noFavicon = this.application.options.getValue('noFavicon') as boolean;
        const hideDate = this.application.options.getValue('hideDate') as boolean;
        const hideTime = this.application.options.getValue('hideTime') as boolean;
        const hideGenerator = this.application.options.getValue('hideGenerator') as boolean;
        const typedocVersion = this.application.options.getValue('typedocVersion') as boolean;

        // Add icon.
        if (!noFavicon) {
            const faviconUrl = makeRelativeToRoot(page.url, favicon);
            page.contents = appendFavicon(page.contents, faviconUrl);
        }

        // Add TypeDoc version.
        if (typedocVersion) {
            page.contents = appendToFooter(page.contents, ` version ${TYPEDOC_VERSION}`);
        }

        // Add generation date and/or time.
        if (!hideGenerator && (!hideDate || !hideTime)) {
            const now = new Date();
            const date = ` the ${now.toLocaleDateString()}`
            const time = ` at ${now.toLocaleTimeString()}`;

            let dateTime = ',';
            if (!hideDate) dateTime += date;
            if (!hideTime) dateTime += time;

            page.contents = appendToFooter(page.contents, dateTime);
        }
    }
}

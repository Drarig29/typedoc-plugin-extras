import { makeRelativeToRoot, appendFavicon, appendToFooter } from './helpers';
import { RendererComponent } from 'typedoc/dist/lib/output/components';
import { PageEvent } from 'typedoc/dist/lib/output/events';
import { basename } from 'path';

// const TYPEDOC_VERSION = require('typedoc/package.json').version;

export class ExtrasPlugin extends RendererComponent {

    initialize() {
        this.listenTo(this.owner, PageEvent.END, this.onRendererEndPage);
    }

    private onRendererEndPage(page: PageEvent) {
        if (!page.contents)
            return

        const hideGenerator = this.application.options.getValue('hideGenerator') as boolean;
        const favicon = basename(this.application.options.getValue('favicon') as string);
        const footerDate = this.application.options.getValue('footerDate') as boolean;
        const footerTime = this.application.options.getValue('footerTime') as boolean;
        const footerTypedocVersion = this.application.options.getValue('footerTypedocVersion') as boolean;

        // Add icon.
        if (favicon) {
            const faviconUrl = makeRelativeToRoot(page.url, favicon);
            page.contents = appendFavicon(page.contents, faviconUrl);
        }

        // Add TypeDoc version.
        if (footerTypedocVersion) {
            // page.contents = appendToFooter(page.contents, ` version ${TYPEDOC_VERSION}`);
        }

        // Add generation date and/or time.
        if (!hideGenerator && (footerDate || footerTime)) {
            const now = new Date();
            const date = ` the ${now.toLocaleDateString()}`
            const time = ` at ${now.toLocaleTimeString()}`;

            let dateTime = ',';
            if (footerDate) dateTime += date;
            if (footerTime) dateTime += time;

            page.contents = appendToFooter(page.contents, dateTime);
        }
    }
}

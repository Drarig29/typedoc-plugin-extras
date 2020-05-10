import { RendererComponent } from 'typedoc/dist/lib/output/components';
import { PageEvent } from 'typedoc/dist/lib/output/events';
import { JSDOM } from 'jsdom';
import { basename } from 'path';

export class ExtrasPlugin extends RendererComponent {

    initialize() {
        this.listenTo(this.owner, PageEvent.END, this.onRendererEndPage);
    }

    private onRendererEndPage(page: PageEvent) {
        const dom = new JSDOM(page.contents);
        const document = dom.window.document;

        const noFavicon = this.application.options.getValue('no-favicon') as boolean;
        const favicon = basename(this.application.options.getValue('favicon') as string);
        const hideDate = this.application.options.getValue('hideDate') as boolean;
        const hideTime = this.application.options.getValue('hideTime') as boolean;

        // Add icon.
        if (!noFavicon) {
            const head = document.querySelector('head');
            head.innerHTML += `<link rel="icon" href="${favicon}" />`;
        }

        // Add generation date and/or time.
        if (!hideDate || !hideTime) {
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

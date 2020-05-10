import { RendererComponent } from 'typedoc/dist/lib/output/components';
import { PageEvent } from 'typedoc/dist/lib/output/events';
import { JSDOM } from 'jsdom';

interface PluginConfig {
    favicon: string,
    hideDate: boolean,
    hideTime: boolean
}

export class ExtrasPlugin extends RendererComponent {

    private readonly config: PluginConfig;

    constructor(owner: any, config: PluginConfig) {
        super(owner);
        this.config = config;
    }

    initialize() {
        this.listenTo(this.owner, PageEvent.END, this.onRendererEndPage);
    }

    private onRendererEndPage(page: PageEvent) {
        const dom = new JSDOM(page.contents);
        const document = dom.window.document;

        // Add icon.
        const head = document.querySelector('head');
        head.innerHTML += `<link rel="icon" href="${this.config.favicon}" />`;

        // Add generation date and/or time.
        if (!this.config.hideDate || !this.config.hideTime) {
            const p = document.querySelector('body > div.container.tsd-generator > p');
            const now = new Date();
            const date = ` the ${now.toLocaleDateString()}`
            const time = ` at ${now.toLocaleTimeString()}`;

            p.innerHTML += ',';
            if (!this.config.hideDate) p.innerHTML += date;
            if (!this.config.hideTime) p.innerHTML += time;
        }

        page.contents = dom.serialize();
    }
}

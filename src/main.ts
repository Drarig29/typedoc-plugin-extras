import { Application, ParameterType, PageEvent, RendererEvent } from 'typedoc';
import {
    appendToFooter,
    replaceTopMostTitle,
    replaceDescription,
    setupNewlineInFooter,
    getLastModifiedScript,
    getDateTimeScript,
    deprecatedOption,
} from './helpers.js';

const TYPEDOC_VERSION = Application.VERSION;

export const pluginOptions = (app: Application) => ({
    options: () => {
        deprecatedOption(app, { name: 'customTitleLink', inFavorOf: 'titleLink' })
        deprecatedOption(app, { name: 'gaMeasurementId', inFavorOf: 'gaID' })

        return {
            outDir: app.options.getValue('out') as string | undefined,
            hideGenerator: app.options.getValue('hideGenerator') as boolean,
            footerDate: app.options.getValue('footerDate') as boolean,
            footerTime: app.options.getValue('footerTime') as boolean,
            footerLastModified: app.options.getValue('footerLastModified') as boolean,
            footerTypedocVersion: app.options.getValue('footerTypedocVersion') as boolean,
            customTitle: app.options.getValue('customTitle') as string | undefined,
            customDescription: app.options.getValue('customDescription') as string | undefined,
        }
    },
});

export type PluginOptionsGetter = ReturnType<typeof pluginOptions>;
export type PluginOptions = ReturnType<PluginOptionsGetter['options']>;

export function load(app: Application) {
    app.options.addDeclaration({
        name: 'footerTypedocVersion',
        help: 'Extras Plugin: Appends the TypeDoc version in the footer.',
        type: ParameterType.Boolean,
        defaultValue: false
    });

    app.options.addDeclaration({
        name: 'footerDate',
        help: 'Extras Plugin: Appends the date of generation in the footer.',
        type: ParameterType.Boolean,
        defaultValue: false
    });

    app.options.addDeclaration({
        name: 'footerTime',
        help: 'Extras Plugin: Appends the time of generation in the footer.',
        type: ParameterType.Boolean,
        defaultValue: false
    });

    app.options.addDeclaration({
        name: 'footerLastModified',
        help: 'Extras Plugin: Appends a "Last Modified" text in the footer.',
        type: ParameterType.Boolean,
        defaultValue: false,
    });

    app.options.addDeclaration({
        name: 'customTitle',
        help: 'Extras Plugin: Specify a custom title, for the top-most title only.',
        type: ParameterType.String,
        defaultValue: undefined
    });

    app.options.addDeclaration({
        name: 'customDescription',
        help: 'Extras Plugin: Specify a custom description for the website.',
        type: ParameterType.String,
        defaultValue: undefined
    });

    app.options.addDeclaration({
        name: 'customTitleLink',
        help: 'Extras Plugin: deprecated. Will be removed in the next release.',
    });

    app.options.addDeclaration({
        name: 'gaMeasurementId',
        help: 'Extras Plugin: deprecated. Will be removed in the next release.'
    });

    const options = pluginOptions(app);

    app.renderer.on(PageEvent.END, onPageRendered.bind(options));
}

function onPageRendered(this: PluginOptionsGetter, page: PageEvent) {
    if (!page.contents)
        return;

    const options = this.options();

    // Add TypeDoc version.
    if (options.footerTypedocVersion) {
        page.contents = appendToFooter(page.contents, ` v${TYPEDOC_VERSION}`);
    }

    // Add generation date.
    if (!options.hideGenerator && (options.footerLastModified || options.footerDate || options.footerTime)) {
        const now = new Date();

        const script = options.footerLastModified
            ? getLastModifiedScript()
            : getDateTimeScript(options);

        // Populate the generation date element on page load.
        const html = `<br>
            <span id="generation-date"></span>
            <script>
                window.GENERATION_DATE = ${now.getTime()};

                (() => {
                    ${script}
                })();
            </script>
        `;

        page.contents = setupNewlineInFooter(page.contents);
        page.contents = appendToFooter(page.contents, html);
    }

    // Set custom title.
    if (options.customTitle) {
        page.contents = replaceTopMostTitle(page.contents, options.customTitle);
    }

    // Set custom description.
    if (options.customDescription) {
        page.contents = replaceDescription(page.contents, options.customDescription);
    }
}


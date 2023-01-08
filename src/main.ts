import { Application, ParameterType, PageEvent, RendererEvent } from 'typedoc';
import { join, basename } from 'path';
import { copyFileSync } from 'fs';
import {
    appendFavicon,
    appendToFooter,
    makeRelativeToRoot,
    isUrl,
    replaceTopMostTitle,
    replaceTopMostTitleLink,
    replaceDescription,
    setupNewlineInFooter,
    getLastModifiedScript,
    getDateTimeScript,
    insertGAScriptInHead
} from './helpers';

const TYPEDOC_VERSION = Application.VERSION;

export const pluginOptions = (app: Application) => ({
    options: () => ({
        outDir: app.options.getValue('out') as string | undefined,
        hideGenerator: app.options.getValue('hideGenerator') as boolean,
        favicon: app.options.getValue('favicon') as string | undefined,
        footerDate: app.options.getValue('footerDate') as boolean,
        footerTime: app.options.getValue('footerTime') as boolean,
        footerLastModified: app.options.getValue('footerLastModified') as boolean,
        footerTypedocVersion: app.options.getValue('footerTypedocVersion') as boolean,
        customTitle: app.options.getValue('customTitle') as string | undefined,
        customTitleLink: app.options.getValue('customTitleLink') as string | undefined,
        customDescription: app.options.getValue('customDescription') as string | undefined,
        gaMeasurementId: app.options.getValue('gaMeasurementId') as string | undefined,
    }),
});

export type PluginOptionsGetter = ReturnType<typeof pluginOptions>;
export type PluginOptions = ReturnType<PluginOptionsGetter['options']>;

export function load(app: Application) {
    app.options.addDeclaration({
        name: 'favicon',
        help: 'Extras Plugin: Specify the name of the favicon file.',
        type: ParameterType.String,
        defaultValue: undefined
    });

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
        name: 'customTitleLink',
        help: 'Extras Plugin: Specify a custom link for the top-most title.',
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
        name: 'gaMeasurementId',
        help: 'Extras Plugin: Specify a Google Analytics measurement ID to insert in a gtag.js snippet.'
    });

    const options = pluginOptions(app);

    app.renderer.on(PageEvent.END, onPageRendered.bind(options));
    app.renderer.once(RendererEvent.END, onRenderFinished.bind(options));
}

function onPageRendered(this: PluginOptionsGetter, page: PageEvent) {
    if (!page.contents)
        return;

    const options = this.options();

    // Add icon.
    if (options.favicon) {
        const favicon = isUrl(options.favicon)
            ? options.favicon
            : makeRelativeToRoot(page.url, basename(options.favicon));

        page.contents = appendFavicon(page.contents, favicon);
    }

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

    // Set custom title link.
    if (options.customTitleLink) {
        page.contents = replaceTopMostTitleLink(page.contents, options.customTitleLink);
    }

    // Set custom description.
    if (options.customDescription) {
        page.contents = replaceDescription(page.contents, options.customDescription);
    }

    // Insert Google Analytics script.
    if (options.gaMeasurementId) {
        page.contents = insertGAScriptInHead(page.contents, options.gaMeasurementId);
    }
}

function onRenderFinished(this: PluginOptionsGetter) {
    const options = this.options()

    // Copy favicon to output directory.
    if (options.favicon && !isUrl(options.favicon)) {
        const workingDir = process.cwd();
        const outDir = options.outDir || './docs';

        const inputFavicon = (options.favicon.indexOf(workingDir) === -1) ?
            join(workingDir, options.favicon) : options.favicon;

        const outputFavicon = (outDir.indexOf(workingDir) === -1) ?
            join(workingDir, outDir, basename(options.favicon)) : join(outDir, basename(options.favicon));

        copyFileSync(inputFavicon, outputFavicon);
    }
}

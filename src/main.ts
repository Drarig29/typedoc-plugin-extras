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
    replaceDescription
} from './helpers';

const TYPEDOC_VERSION = Application.VERSION;

const pluginOptions = (app: Application) => ({
    options: () => ({
        outDir: app.options.getValue('out') as string | undefined,
        hideGenerator: app.options.getValue('hideGenerator') as boolean,
        favicon: app.options.getValue('favicon') as string | undefined,
        footerDate: app.options.getValue('footerDate') as boolean,
        footerTime: app.options.getValue('footerTime') as boolean,
        footerTypedocVersion: app.options.getValue('footerTypedocVersion') as boolean,
        customTitle: app.options.getValue('customTitle') as string | undefined,
        customTitleLink: app.options.getValue('customTitleLink') as string | undefined,
        customDescription: app.options.getValue('customDescription') as string | undefined
    }),
});

type PluginOptions = ReturnType<typeof pluginOptions>;

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

    const options = pluginOptions(app);

    app.renderer.on(PageEvent.END, onPageRendered.bind(options));
    app.renderer.once(RendererEvent.END, onRenderFinished.bind(options));
}

function onPageRendered(this: PluginOptions, page: PageEvent) {
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
        page.contents = appendToFooter(page.contents, ` version ${TYPEDOC_VERSION}`);
    }

    // Add generation date and/or time.
    if (!options.hideGenerator && (options.footerDate || options.footerTime)) {
        const now = new Date();
        const date = ` the ${now.toLocaleDateString()}`;
        const time = ` at ${now.toLocaleTimeString()}`;

        let dateTime = ',';
        if (options.footerDate) dateTime += date;
        if (options.footerTime) dateTime += time;

        page.contents = appendToFooter(page.contents, dateTime);
    }

    // Set custom title.
    if (options.customTitle) {
        page.contents = replaceTopMostTitle(page.contents, options.customTitle);
    }

    // Set custom title link.
    if (options.customTitleLink) {
        page.contents = replaceTopMostTitleLink(page.contents, options.customTitleLink);
    }

    // Set custom description
    if (options.customDescription) {
        page.contents = replaceDescription(page.contents, options.customDescription);
    }
}

function onRenderFinished(this: PluginOptions) {
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

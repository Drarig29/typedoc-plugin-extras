import { Application, ParameterType, PageEvent, RendererEvent } from 'typedoc';
import { appendFavicon, appendToFooter, makeRelativeToRoot } from './helpers';
import { join, basename } from 'path';
import { copyFileSync } from 'fs';

const TYPEDOC_VERSION = Application.VERSION;

const pluginOptions = (app: Application) => ({
    options: () => ({
        outDir: app.options.getValue('out') as string | undefined,
        hideGenerator: app.options.getValue('hideGenerator') as boolean,
        faviconPath: app.options.getValue('favicon') as string | undefined,
        footerDate: app.options.getValue('footerDate') as boolean,
        footerTime: app.options.getValue('footerTime') as boolean,
        footerTypedocVersion: app.options.getValue('footerTypedocVersion') as boolean,
    })
})

type PluginOptions = ReturnType<typeof pluginOptions>

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

    const options = pluginOptions(app)

    app.renderer.on(PageEvent.END, onPageRendered.bind(options));
    app.renderer.once(RendererEvent.END, onRenderFinished.bind(options));
}

function onPageRendered(this: PluginOptions, page: PageEvent) {
    if (!page.contents)
        return;

    const options = this.options()

    // Add icon.
    if (options.faviconPath) {
        const faviconFilename = basename(options.faviconPath);
        const faviconUrl = makeRelativeToRoot(page.url, faviconFilename);
        page.contents = appendFavicon(page.contents, faviconUrl);
    }

    // Add TypeDoc version.
    if (options.footerTypedocVersion) {
        page.contents = appendToFooter(page.contents, ` version ${TYPEDOC_VERSION}`);
    }

    // Add generation date and/or time.
    if (!options.hideGenerator && (options.footerDate || options.footerTime)) {
        const now = new Date();
        const date = ` the ${now.toLocaleDateString()}`
        const time = ` at ${now.toLocaleTimeString()}`;

        let dateTime = ',';
        if (options.footerDate) dateTime += date;
        if (options.footerTime) dateTime += time;

        page.contents = appendToFooter(page.contents, dateTime);
    }
}

function onRenderFinished(this: PluginOptions) {
    const options = this.options()
    if (!options.faviconPath)
        return;

    const workingDir = process.cwd();
    const outDir = options.outDir || './docs';

    const inputFavicon = (options.faviconPath.indexOf(workingDir) === -1) ?
        join(workingDir, options.faviconPath) : options.faviconPath;

    const outputFavicon = (outDir.indexOf(workingDir) === -1) ?
        join(workingDir, outDir, basename(options.faviconPath)) : join(outDir, basename(options.faviconPath));

    copyFileSync(inputFavicon, outputFavicon);
}
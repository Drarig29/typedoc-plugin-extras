import { Application, ParameterType, PageEvent, RendererEvent } from 'typedoc';
import { appendFavicon, appendToFooter, makeRelativeToRoot } from './helpers';
import { join, basename } from 'path';
import { copyFileSync } from 'fs';

const TYPEDOC_VERSION = Application.VERSION;

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
    })

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

    app.renderer.on(PageEvent.END, (page: PageEvent) => {
        if (!page.contents)
            return

        const hideGenerator = app.options.getValue('hideGenerator') as boolean;
        const favicon = basename(app.options.getValue('favicon') as string);
        const footerDate = app.options.getValue('footerDate') as boolean;
        const footerTime = app.options.getValue('footerTime') as boolean;
        const footerTypedocVersion = app.options.getValue('footerTypedocVersion') as boolean;

        // Add icon.
        if (favicon) {
            const faviconUrl = makeRelativeToRoot(page.url, favicon);
            page.contents = appendFavicon(page.contents, faviconUrl);
        }

        // Add TypeDoc version.
        if (footerTypedocVersion) {
            page.contents = appendToFooter(page.contents, ` version ${TYPEDOC_VERSION}`);
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
    });

    app.renderer.once(RendererEvent.END, () => {
        const faviconPath = app.options.getValue('favicon') as string | undefined;
        if (!faviconPath)
            return

        const workingDir = process.cwd();
        const outDir = app.options.getValue('out') || './docs';

        const inputFavicon = (faviconPath.indexOf(workingDir) === -1) ?
            join(workingDir, faviconPath) : faviconPath;

        const outputFavicon = (outDir.indexOf(workingDir) === -1) ?
            join(workingDir, outDir, basename(faviconPath)) : join(outDir, basename(faviconPath));

        copyFileSync(inputFavicon, outputFavicon);
    });
}
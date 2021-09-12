import { Application } from 'typedoc';
import { PluginHost, ParameterType } from 'typedoc/dist/lib/utils';
import { ExtrasPlugin } from './plugin';
import { copyFileSync } from 'fs';
import { join, basename } from 'path';
import { RendererEvent } from 'typedoc/dist/lib/output/events';

export function load(host: PluginHost) {
    const app: Application = host.application;

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

    app.renderer.addComponent('extras', new ExtrasPlugin(app.renderer));
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
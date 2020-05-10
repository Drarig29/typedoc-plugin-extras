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
        help: 'Extras Plugin: The name of the favicon file.',
        type: ParameterType.String,
        defaultValue: 'public/favicon.ico'
    });

    app.options.addDeclaration({
        name: 'hideDate',
        help: 'Extras Plugin: Hides the date of generation at the end of documentation pages.',
        type: ParameterType.Boolean,
        defaultValue: false
    });

    app.options.addDeclaration({
        name: 'hideTime',
        help: 'Extras Plugin: Hides the time of generation at the end of documentation pages.',
        type: ParameterType.Boolean,
        defaultValue: false
    });

    app.renderer.addComponent('extras', new ExtrasPlugin(app.renderer));
    app.renderer.once(RendererEvent.END, () => {
        const faviconPath = app.options.getValue('favicon') as string;
        const workingDir = process.cwd();
        const outDir = app.options.getValue('out') || './docs';

        const inputFavicon = join(workingDir, faviconPath);
        const outputFavicon = join(workingDir, outDir, basename(faviconPath));

        copyFileSync(inputFavicon, outputFavicon);
    });
}
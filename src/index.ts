import { ParameterType, Application } from 'typedoc';
import { PluginHost } from 'typedoc/dist/lib/utils';
import { RendererEvent } from 'typedoc/dist/lib/output/events';
import { Context } from 'typedoc/dist/lib/converter';

export function load(host: PluginHost) {
    const app: Application = host.application;

    app.options.addDeclaration({
        name: 'plugin-option',
        help: 'Displayed when --help is passed',
        type: ParameterType.String,
        defaultValue: ''
    });

    app.renderer.on(RendererEvent.END, (context: Context) => {
        console.log(context);
    });
}
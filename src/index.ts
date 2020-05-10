import { Application } from 'typedoc';
import { PluginHost } from 'typedoc/dist/lib/utils';
import { ExtrasPlugin } from "./plugin";

export function load(host: PluginHost) {
    const app: Application = host.application;

    // app.options.addDeclaration({
    //     name: 'plugin-option',
    //     help: 'Displayed when --help is passed',
    //     type: ParameterType.String,
    //     defaultValue: ''
    // });

    app.renderer.addComponent('extras', new ExtrasPlugin(app.renderer));
}
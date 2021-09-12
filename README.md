# typedoc-plugin-extras

**This plugin only works for HTML documentation.**

A plugin for [TypeDoc](https://github.com/TypeStrong/typedoc) that adds extras to the generated documentation (favicon and date/time of generation).

- It can find the `<head>` of the document and append a favicon to it.
- It can also add date/time of generation after "Generated using TypeDoc" in the footer (see Example).

**No date/time will be added if `--hideGenerator` is set (because the footer wouldn't exist).**

Feel free to ask for another extra or to make a PR 😉

[![npm](https://img.shields.io/npm/v/typedoc-plugin-extras.svg)](https://www.npmjs.com/package/typedoc-plugin-extras)

## Example

![Example](public/example.png)

## Installation

```bash
npm install --save-dev typedoc-plugin-extras
```

## Usage

```bash
$ npx typedoc --plugin typedoc-plugin-extras [args]
```

## Arguments

The following arguments can be used in addition to the default [TypeDoc arguments](https://github.com/TypeStrong/typedoc#arguments).

- `--favicon`<br>
  Specify the name of the favicon file.<br>
  Example: `public/favicon.ico`

- `--footerTypedocVersion`<br>
  Appends the TypeDoc version in the footer.<br>
  Default: `false`

- `--footerDate`<br>
  Appends the date of generation in the footer.<br>
  Default: `false`

- `--footerTime`<br>
  Appends the time of generation in the footer.<br>
  Default: `false`

**Note:**

- All extras are disabled by default, they are now opt-in.
- When favicon is enabled, its file is copied into the documentation's output directory (`--out`).

## Testing

To test this plugin, you can generate TypeDoc documentation _for this plugin_.

To do this, you'll first need to build the plugin:

```bash
npm run build
```

Then, link the package to have it in the local `node_modules`:

```bash
npm link
```

You can now generate the documentation with the plugin (from the source):

```bash
npm run test
```

## License

[MIT](https://github.com/Drarig29/typedoc-plugin-extras/blob/master/LICENSE)

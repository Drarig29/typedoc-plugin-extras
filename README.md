# typedoc-plugin-extras

**This plugin only works for HTML documentation.**

A plugin for [TypeDoc](https://github.com/TypeStrong/typedoc) that adds extras to the generated documentation (favicon and date/time of generation).

* It can find the `<head>` of the document and append a favicon to it.
* It can also add date/time of generation after "Generated using TypeDoc" in the footer (see Example).

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
  Specify the name of the favicon file. Default: `'public/favicon.ico'`
- `--noFavicon`<br>
  Disable the favicon.
- `--hideDate`<br>
  Hide the date at the end of documentation pages.
- `--hideTime`<br>
  Hide the time at the end of documentation pages.

**Note:** Favicon, date and time are enabled by default.
When favicon is enabled, its file is copied into the documentation's output directory (`--out`).

## Testing

To test this plugin, you can generate TypeDoc documentation _for this plugin_.

First, link the package with npm:

```bash
npm link
```

Then, you can generate the documentation with the plugin (from source):

```bash
npm run test
```

If you want, you can watch your changes with:

```bash
npm start
```

You will need to generate the documentation each time.

## License

[MIT](https://github.com/Drarig29/typedoc-plugin-extras/blob/master/LICENSE)

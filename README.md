# Unofficial TailwindCSS Obsidian Plugin

This plugin uses [TailwindCSS](https://tailwindcss.com/) (via [PostCSS](https://postcss.org/)) to produce a CSS snippet in your Obsidian vault.

## How it works

This plugin effectively implements [Tailwind's PostCSS installation guide](https://tailwindcss.com/docs/installation/using-postcss),
but with the [`postcss`](https://postcss.org/api/) JavaScript API.
The output is a CSS snippet which **you must manually enable** once it is created.
This snippet will update based on changes to your files and settings.

This plugin makes use of the [FileSystemAdapter](https://docs.obsidian.md/Reference/TypeScript+API/FileSystemAdapter/FileSystemAdapter) API
to read and write files in your vault's configuration directory.

## Installation

At the time of writing, this plugin has not yet been submitted as a community plugin.
Therefore, you must manually install this plugin, as you might do so for the [`hot-reload` plugin](https://github.com/pjeby/hot-reload).

In the Releases section for this repository, you can find the zip archive that contains all of the individual files.
Unzip that archive so that its contents are in a new directory called `unofficial-tailwindcss-plugin/`.
Then you should be good to go after restarting Obsidian and enabling the plugin.

Don't forget to enable the generated CSS snippet after it appears.

## Settings

### Preflight

[Preflight](https://tailwindcss.com/docs/preflight) is a set of base styles that Tailwind injects into its `@tailwind base` directive.
In a more literal sense, [`preflight`](https://github.com/tailwindlabs/tailwindcss/blob/master/src/corePlugins.js#L494)
is one of Tailwind's core plugins, and it parses a static stylesheet named [`preflight.css`](https://github.com/tailwindlabs/tailwindcss/blob/master/src/css/preflight.css),
feeding the styles into its `addBase` utility function.

However, the `preflight` plugin uses `__dirname` and `path.join` to locate the stylesheet, which results in an error in the context of the
Obsidian application built with [Electron](https://www.electronjs.org/).
Additionally, Preflight styles conflict with Obsidian's base styles such that:

1. the Obsidian UI is affected by Preflight styles, and
2. some Preflight styles are overriden by Obsidian styles.

Therefore, this plugin (the Unofficial TailwindCSS Obsidian Plugin) does not apply Preflight styles by default.
You can enable Preflight in the plugin settings, which will direct the plugin to source a packaged copy of `preflight.css` using the Obsidian API.

### Prefix selector

You may also control what is affected by Tailwind's CSS rules by enabling this plugin's prefix selector option.
This will add a prefix (default `.tailwind`) to all CSS selectors using a [descendant combinator](https://developer.mozilla.org/en-US/docs/Web/CSS/Descendant_combinator).
so that `.a, #foo.bar` becomes `.tailwind .a, .tailwind #foo.bar`.

You can configure this so that only certain notes (or even certain sections of notes) are affected by Tailwind.

### PostCSS entrypoint

By default, this plugin will use Tailwind's default input template, which combines three of its directives:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

You can specify a custom entrypoint using a file path that is relative to your vault's configuration directory.
This is useful if you want to use Tailwind's `@layer` directive for your own purposes.

### Tailwind theme

You can specify a custom Tailwind theme using a file path that is relative to your vault's configuration directory.
The file contents should be a JSON object.
This is useful if you want to replace or extend Tailwind's default theme.

## Developer Notes

Take note of the distinction between the name of the repository and the ID of the plugin.
Make sure that you clone this repository into a directory named `unofficial-tailwindcss-plugin`.

After installing dependencies (using `npm` for this project), you should copy the Preflight styles into the root of the project.
```cp node_modules/tailwindcss/lib/css/preflight.css .```

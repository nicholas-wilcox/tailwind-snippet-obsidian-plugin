# Unofficial Obsidian TailwindCSS Plugin

This plugin uses [TailwindCSS](https://tailwindcss.com/) (via [PostCSS](https://postcss.org/)) to produce a CSS snippet in your Obsidian vault.

## How it works

This plugin effectively implements [Tailwind's PostCSS installation guide](https://tailwindcss.com/docs/installation/using-postcss),
but with the [`postcss`](https://postcss.org/api/) JavaScript API.
The output is a CSS snippet which **you must manually enable** once it is created.
This snippet will update based on changes to your files and settings.

This plugin makes use of the [FileSystemAdapter](https://docs.obsidian.md/Reference/TypeScript+API/FileSystemAdapter/FileSystemAdapter) API
to read and write files in your vault's configuration directory.

## Note on Preflight

[Preflight](https://tailwindcss.com/docs/preflight) is a set of base styles that Tailwind injects into its `@tailwind base` directive.
In a more literal sense, [`preflight`](https://github.com/tailwindlabs/tailwindcss/blob/master/src/corePlugins.js#L494)
is one of Tailwind's core plugins, and it parses a static stylesheet named [`preflight.css`](https://github.com/tailwindlabs/tailwindcss/blob/master/src/css/preflight.css),
feeding the styles into its `addBase` utility function.

However, the `preflight` plugin uses `__dirname` and `path.join` to locate the stylesheet, which results in an error in the context of the
Obsidian application built with [Electron](https://www.electronjs.org/).
Additionally, Preflight styles conflict with Obsidian's base styles such that:

1. the Obsidian UI is affected by Preflight styles, and
2. some Preflight styles are overriden by Obsidian styles.

Therefore, this plugin (the Unofficial Obsidian TailwindCSS Plugin) does not apply Preflight styles by default.
You can enable a setting to replicate the functionality of Preflight in a custom Tailwind plugin that instead sources a copy of `preflight.css` using the Obsidian API.

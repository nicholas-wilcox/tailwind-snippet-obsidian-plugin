# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- #### Subheading order reference -->
<!-- -   `Added` -->
<!-- -   `Changed` -->
<!-- -   `Deprecated` -->
<!-- -   `Removed` -->
<!-- -   `Fixed` -->
<!-- -   `Security` -->

## [Unreleased]

### Added

-   Ribbon icon to manually refresh the generated CSS snippet.
-   The `debug` NPM package as a dependency.
-   Notices
    -   On manual refreshes

## [0.4.1] - 2024-08-01

### Added

-   Test Obsidian vault.

### Changed

-   Better README
-   Formatted code
-   Changed wording in plugin settings

## [0.4.0] - 2024-07-30

### Changed

-   Updated all dependencies.
-   Updated year in LICENSE file.

## [0.3.1] - 2023-08-30

### Changed

-   Skip main routine if no content is found for TailwindCSS to process.

### Fixed

-   Use correct value for plugin name that is also the name of the release
    archive.
-   Create snippets directory during onload if it does not already exist.

## [0.3.0] - 2023-07-30

### Added

-   Added `margin-left` to prefix selector setting to denote its dependency on
    the prefix selector toggle.
-   Custom TailwindCSS/PostCSS entrypoint setting.
-   Custom TailwindCSS theme setting.
-   Custom TailwindCSS content setting.

### Changed

-   Refactor `enablePrefixer` to `addPrefixSelector`.

### Fixed

-   Dynamically enable and disable the prefix selector setting when the feature
    is toggled.
-   Removed 'obsidian' from plugin ID in `manifest.json`.
-   Removed 'obsidian' from plugin ID in `README.md` installation instructions.

## [0.2.2] - 2023-07-01

### Added

-   Developer notes in README.

### Fixed

-   Use new name of plugin when referencing static files.

## [0.2.1] - 2023-06-27

### Added

-   Installation instructions.

### Fixed

-   Added `tailwind.css` and `preflight.css` to the release.

## [0.2.0] - 2023-06-25

### Added

-   MIT License with credits to packaged dependencies
-   Users can prefix all of Tailwind's styles with a configurable CSS selector.

## [0.1.0] - 2023-06-22

### Added

-   Created the Unofficial TailwindCSS Obsidian Plugin, which uses TailwindCSS
    and PostCSS to generate a CSS snippet from a vault's Markdown files.
-   Users can opt to enable TailwindCSS's Preflight styles.

[unreleased]:
	https://github.com/nicholas-wilcox/unofficial-tailwindcss-obsidian-plugin/compare/0.4.1...HEAD
[0.4.1]:
	https://github.com/nicholas-wilcox/unofficial-tailwindcss-obsidian-plugin/compare/0.4.0...0.4.1
[0.4.0]:
	https://github.com/nicholas-wilcox/unofficial-tailwindcss-obsidian-plugin/compare/0.3.1...0.4.0
[0.3.1]:
	https://github.com/nicholas-wilcox/unofficial-tailwindcss-obsidian-plugin/compare/0.3.0...0.3.1
[0.3.0]:
	https://github.com/nicholas-wilcox/unofficial-tailwindcss-obsidian-plugin/compare/0.2.2...0.3.0
[0.2.2]:
	https://github.com/nicholas-wilcox/unofficial-tailwindcss-obsidian-plugin/compare/0.2.1...0.2.2
[0.2.1]:
	https://github.com/nicholas-wilcox/unofficial-tailwindcss-obsidian-plugin/compare/0.2.0...0.2.1
[0.2.0]:
	https://github.com/nicholas-wilcox/unofficial-tailwindcss-obsidian-plugin/compare/0.1.0...0.2.0
[0.1.0]:
	https://github.com/nicholas-wilcox/unofficial-tailwindcss-obsidian-plugin/releases/tag/0.1.0

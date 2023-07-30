# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

#### Subheading order reference

- `Added`
- `Changed`
- `Deprecated`
- `Removed`
- `Fixed`
- `Security`

## [Unreleased]

### Added

- Custom TailwindCSS/PostCSS entrypoint setting.
- Custom TailwindCSS theme setting.
- Custom TailwindCSS content setting.

### Fixed

- Removed 'obsidian' from plugin ID in `manifest.json`.
- Removed 'obsidian' from plugin ID in `README.md` installation instructions.

### Added

- Added `margin-left` to prefix selector setting to denote its dependency on the prefix selector toggle.

### Changed

- Refactor `enablePrefixer` to `addPrefixSelector`.

### Fixed

- Dynamically enable and disable the prefix selector setting when the feature is toggled.

## [0.2.2] - 2023-07-01

### Added

- Developer notes in README.

### Fixed

- Use new name of plugin when referencing static files.

## [0.2.1] - 2023-06-27

### Added

- Installation instructions.

### Fixed

- Added `tailwind.css` and `preflight.css` to the release.

## [0.2.0] - 2023-06-25

### Added

- MIT License with credits to packaged dependencies
- Users can prefix all of Tailwind's styles with a configurable CSS selector.

## [0.1.0] - 2023-06-22

### Added

- Created the Unofficial TailwindCSS Obsidian Plugin, which uses TailwindCSS and PostCSS
  to generate a CSS snippet from a vault's Markdown files.
- Users can opt to enable TailwindCSS's Preflight styles.

[unreleased]: https://github.com/nicholas-wilcox/unofficial-tailwindcss-obsidian-plugin/compare/0.2.2...HEAD
[0.2.2]: https://github.com/nicholas-wilcox/unofficial-tailwindcss-obsidian-plugin/compare/0.2.1...0.2.2
[0.2.1]: https://github.com/nicholas-wilcox/unofficial-tailwindcss-obsidian-plugin/compare/0.2.0...0.2.1
[0.2.0]: https://github.com/nicholas-wilcox/unofficial-tailwindcss-obsidian-plugin/compare/0.1.0...0.2.0
[0.1.0]: https://github.com/nicholas-wilcox/unofficial-tailwindcss-obsidian-plugin/releases/tag/0.1.0

import { FileSystemAdapter, Plugin, normalizePath } from 'obsidian';
import postcss, { AcceptedPlugin } from 'postcss';
import prefixer from 'postcss-prefix-selector';
import autoprefixer from 'autoprefixer';
import tailwindcss, { Config as TailwindConfig } from 'tailwindcss';
import { version as tailwindVersion } from 'tailwindcss/package.json';
import plugin from 'tailwindcss/plugin'
import { UnofficialTailwindPluginSettings, DEFAULT_SETTINGS, SettingsTab } from './settings';
import { id as pluginId } from './manifest.json';

export default class UnofficialTailwindPlugin extends Plugin {
	settings: UnofficialTailwindPluginSettings;
	preflightPlugin: NonNullable<TailwindConfig['plugins']>[number];

	get vault() {
		return this.app.vault;
	}

	get adapter(): FileSystemAdapter {
		return this.app.vault.adapter as FileSystemAdapter;
	}

	get tailwindPlugins() {
		return this.settings.enablePreflight ? [this.preflightPlugin] : [];
	}

	get tailwindConfig(): TailwindConfig {
		return {
			content: this.vault.getMarkdownFiles().map(f => this.adapter.getFullPath(f.path)),
			theme: {
				extend: {},
			},
			plugins: this.tailwindPlugins,
			corePlugins: {
				preflight: false,
			}
		}
	}

	async onload() {
		await this.loadSettings();
		await this.initPreflightPlugin();
		await this.doTailwind();
		this.registerEvent(this.vault.on('modify', () => this.doTailwind()));
		this.addSettingTab(new SettingsTab(this.app, this));
	}

	onunload() { }

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		await this.doTailwind();
	}

	async initPreflightPlugin() {
		const preflight = normalizePath(this.vault.configDir + `/plugins/${pluginId}/preflight.css`);
		const preflightStyles = postcss.parse(await this.adapter.read(preflight));

		// This is an altered version of the original preflight plugin.
		this.preflightPlugin = plugin(({ addBase }) => {
			addBase([
				// @ts-ignore
				postcss.comment({
					// @ts-ignore
					text: `! tailwindcss v${tailwindVersion} | MIT License | https://tailwindcss.com`,
				}),
				// @ts-ignore
				...preflightStyles.nodes,
			])
		});
	}

	async doTailwind() {
		const cssIn = normalizePath(this.vault.configDir + `/plugins/${pluginId}/tailwind.css`);
		const cssOut = normalizePath(this.vault.configDir + '/snippets/tailwind.css');

		const postcssPlugins: AcceptedPlugin[] = [
			tailwindcss(this.tailwindConfig),
			autoprefixer,
		];

		if (this.settings.addPrefixSelector) {
			// @ts-ignore
			// The postcss-prefix-selector export's return value is declared as
			// `(root: any) => string | undefined`, so it's basically like a TransformCallback.
			postcssPlugins.push(prefixer({
				prefix: this.settings.prefixSelector,
			}));
		}

		const result = await postcss(postcssPlugins).process(await this.adapter.read(cssIn), { from: cssIn, to: cssOut });
		await this.adapter.write(cssOut, result.css);
	}
}

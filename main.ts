import { App, FileSystemAdapter, Plugin, PluginSettingTab, Setting, normalizePath } from 'obsidian';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import tailwindcss, { Config as TailwindConfig } from 'tailwindcss';
import { version as tailwindVersion } from 'tailwindcss/package.json';
import plugin from 'tailwindcss/plugin'

interface UnofficialTailwindPluginSettings {
	enablePreflight: boolean;
}

const DEFAULT_SETTINGS: UnofficialTailwindPluginSettings = {
	enablePreflight: false,
}

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
		const preflight = normalizePath(this.vault.configDir + '/plugins/unofficial-obsidian-tailwindcss-plugin/preflight.css');
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
		const cssIn = normalizePath(this.vault.configDir + '/plugins/unofficial-obsidian-tailwindcss-plugin/tailwind.css');
		const cssOut = normalizePath(this.vault.configDir + '/snippets/tailwind.css');

		const result = await postcss([
			tailwindcss(this.tailwindConfig),
			autoprefixer
		]).process(await this.adapter.read(cssIn), { from: cssIn, to: cssOut });
		await this.adapter.write(cssOut, result.css);
	}
}

class SettingsTab extends PluginSettingTab {
	plugin: UnofficialTailwindPlugin;

	constructor(app: App, plugin: UnofficialTailwindPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Enable Preflight')
			.setDesc(`Adds TailwindCSS's Preflight to the generated stylesheet.
					 (NOTE: Not all styles from Preflight will be applied.
					  Also, Obsidian's UI will be affected.)`)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enablePreflight)
				.onChange(async (value: boolean) => {
					this.plugin.settings.enablePreflight = value;
					await this.plugin.saveSettings();
				}));
	}
}

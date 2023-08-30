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

	async onload() {
		await this.loadSettings();
		await this.initPreflightPlugin();
		await this.checkSnippetsDirectory();
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

	async getTailwindConfig(): Promise<TailwindConfig> {
		let theme: TailwindConfig['theme'];

		if (Boolean(this.settings.themeConfig)) {
			const themeConfigPath = normalizePath(this.vault.configDir + '/' + this.settings.themeConfig);
			if (await this.adapter.exists(themeConfigPath)) {
				theme = JSON.parse(await this.adapter.read(themeConfigPath));
			} else {
				console.error(`Could not find theme configuration file at '${themeConfigPath}'.`);
			}
		}

		return {
			content: [
				...this.vault.getMarkdownFiles().map(f => this.adapter.getFullPath(f.path)),
				...this.settings.contentConfig.map(glob => this.adapter.getFullPath(normalizePath(this.vault.configDir + '/' + glob))),
			],
			theme,
			plugins: this.tailwindPlugins,
			corePlugins: {
				preflight: false,
			}
		}
	}

	async checkSnippetsDirectory() {
		const snippetsPath = normalizePath(this.vault.configDir + '/snippets');
		if (await this.adapter.exists(snippetsPath)) {
			return;
		} else {
			return this.adapter.mkdir(snippetsPath);
		}
	}

	async doTailwind() {
		const entryPoint = Boolean(this.settings.entryPoint) ? ('/' + this.settings.entryPoint) : `/plugins/${pluginId}/tailwind.css`;
		const cssIn = normalizePath(this.vault.configDir + entryPoint);
		const cssOut = normalizePath(this.vault.configDir + '/snippets/tailwind.css');

		const postcssPlugins: AcceptedPlugin[] = [
			tailwindcss(await this.getTailwindConfig()),
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

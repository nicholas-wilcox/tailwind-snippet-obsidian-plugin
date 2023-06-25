import { App, PluginSettingTab, Setting } from 'obsidian';
import UnofficialTailwindPlugin from './main';

export interface UnofficialTailwindPluginSettings {
	enablePreflight: boolean;
	enablePrefixer: boolean;
	prefixSelector: string;
}

export const DEFAULT_SETTINGS: UnofficialTailwindPluginSettings = {
	enablePreflight: false,
	enablePrefixer: false,
	prefixSelector: '.tailwind',
}

export class SettingsTab extends PluginSettingTab {
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

		new Setting(containerEl)
			.setName('Add prefix to Tailwind selectors')
			.setDesc(`Prefixes all selectors in Tailwind's style rules with another selector.
					  This can be used to prevent Preflight styles from affecting Obsidian's UI.`)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enablePrefixer)
				.onChange(async (value: boolean) => {
					this.plugin.settings.enablePrefixer = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Prefix selector')
			.setDesc(`Will be combined with all Tailwind selectors using a descendant combinator.
					 (e.g. ".a, #foo.bar" => ".tailwind .a, .tailwind #foo.bar")`)
			.addText(text => text
				.setValue(this.plugin.settings.prefixSelector)
				.setDisabled(!this.plugin.settings.enablePrefixer)
				.onChange(async (value: string) => {
					this.plugin.settings.prefixSelector = value;
					await this.plugin.saveSettings();
				}));
	}
}

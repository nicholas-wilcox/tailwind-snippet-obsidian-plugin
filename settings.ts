import { App, normalizePath, PluginSettingTab, Setting } from "obsidian";
import UnofficialTailwindPlugin from "./main";

export interface UnofficialTailwindPluginSettings {
  enablePreflight: boolean;
  addPrefixSelector: boolean;
  prefixSelector: string;
  entryPoint: string;
  themeConfig: string;
  contentConfig: string[];
}

export const DEFAULT_SETTINGS: UnofficialTailwindPluginSettings = {
  enablePreflight: false,
  addPrefixSelector: false,
  prefixSelector: ".tailwind",
  entryPoint: "",
  themeConfig: "",
  contentConfig: [],
};

export class SettingsTab extends PluginSettingTab {
  plugin: UnofficialTailwindPlugin;

  constructor(app: App, plugin: UnofficialTailwindPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  get configDir() {
    return this.plugin.vault.configDir;
  }

  async exists(path: string, sensitive?: boolean) {
    return this.plugin.adapter.exists(path, sensitive);
  }

  async testFile(path: string) {
    return this.exists(normalizePath(`${this.configDir}/${path}`));
  }

  setErrorMessage(controlEl: HTMLElement, message?: string) {
    if (message) {
      let errorMessage: HTMLElement | null =
        controlEl.querySelector(".error-message");
      if (errorMessage === null) {
        errorMessage = document.createElement("span");
        errorMessage.addClass("error-message");
        controlEl.appendChild(errorMessage);
      }
      errorMessage.innerText = message;
      controlEl.addClass("error");
    } else {
      controlEl.removeClass("error");
      controlEl.querySelectorAll(".error-message").forEach((el) => el.remove());
    }
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    const enablePreflightSetting = new Setting(containerEl)
      .setName("Enable Preflight")
      .setDesc(
        `Adds TailwindCSS's Preflight to the generated stylesheet. (NOTE: Not all Preflight styles will be applied, and Obsidian's UI may be affected.)`,
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enablePreflight)
          .onChange(async (value: boolean) => {
            this.plugin.settings.enablePreflight = value;
            await this.plugin.saveSettings();
          }),
      );

    const addPrefixSelectorSetting = new Setting(containerEl)
      .setName("Add prefix to Tailwind selectors")
      .setDesc(
        `Prefixes all selectors in Tailwind's style rules with another selector. This can be used to prevent Preflight styles from affecting Obsidian's UI.`,
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.addPrefixSelector)
          .onChange(async (value: boolean) => {
            this.plugin.settings.addPrefixSelector = value;
            prefixSelectorSetting.setDisabled(!value);
            await this.plugin.saveSettings();
          }),
      );

    const prefixSelectorSetting = new Setting(containerEl)
      .setName("Prefix selector")
      .setDesc(
        `Will be combined with all Tailwind selectors using a descendant combinator. (e.g. ".a, #foo.bar" => ".tailwind .a, .tailwind #foo.bar")`,
      )
      .setClass("prefix-selector")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.prefixSelector)
          .setDisabled(!this.plugin.settings.addPrefixSelector)
          .onChange(async (value: string) => {
            this.plugin.settings.prefixSelector = value;
            await this.plugin.saveSettings();
          }),
      );

    const entryPoint = new Setting(containerEl)
      .setName("PostCSS entrypoint")
      .setDesc(
        `A custom CSS snippet that will be processed by PostCSS and Tailwind instead of the prepackaged input file. See the TailwindCSS documentation for more details.`,
      )
      .addText((text) => {
        text
          .setValue(this.plugin.settings.entryPoint)
          .onChange(async (value: string) => {
            if (value === "" || (await this.testFile(value))) {
              this.plugin.settings.entryPoint = value;
              this.setErrorMessage(entryPoint.controlEl);
              await this.plugin.saveSettings();
            } else {
              this.setErrorMessage(
                entryPoint.controlEl,
                `Could not find file "${value}"`,
              );
            }
          });
      });

    const themeConfig = new Setting(containerEl)
      .setName("Tailwind theme")
      .setDesc(
        `The theme of the Tailwind configuration object. This can be used to extend or replace the default theme. See the TailwindCSS documentation for more details.`,
      )
      .addText((text) =>
        text
          .setValue(this.plugin.settings.themeConfig)
          .onChange(async (value: string) => {
            if (value === "" || (await this.testFile(value))) {
              this.plugin.settings.themeConfig = value;
              this.setErrorMessage(themeConfig.controlEl);
              await this.plugin.saveSettings();
            } else {
              this.setErrorMessage(
                themeConfig.controlEl,
                `Could not find file "${value}"`,
              );
            }
          }),
      );

    const contentConfig = new Setting(containerEl)
      .setName("Tailwind entrypoints")
      .setDesc(
        `A comma-separated list of file globs that will be inspected by Tailwind (relative to your Vault's configuration folder). This will happen in addition to the usual processing of your Markdown files.`,
      )
      .addTextArea((text) =>
        text
          .setValue(this.plugin.settings.contentConfig.join(",\n"))
          .onChange(async (value) => {
            this.plugin.settings.contentConfig = value
              .split(",")
              .map((s) => s.trim())
              .filter((s) => Boolean(s));
            await this.plugin.saveSettings();
          }),
      );
  }
}

import {
  FileSystemAdapter,
  Plugin,
  normalizePath,
  addIcon,
  Notice,
  DataAdapter,
} from "obsidian";
import postcss, { AcceptedPlugin } from "postcss";
import prefixer from "postcss-prefix-selector";
import autoprefixer from "autoprefixer";
import tailwindcss, { Config as TailwindConfig } from "tailwindcss";
import { version as tailwindVersion } from "tailwindcss/package.json";
import plugin from "tailwindcss/plugin";
import {
  TailwindSnippetPluginSettings,
  DEFAULT_SETTINGS,
  SettingTab,
} from "./settings";
import { paintRollerSvg } from "src/paint-roller";
import { INFO, DEBUG, ERROR } from "src/log";

export default class TailwindSnippetPlugin extends Plugin {
  settings: TailwindSnippetPluginSettings;
  preflightPlugin: NonNullable<TailwindConfig["plugins"]>[number];

  get vault() {
    return this.app.vault;
  }

  get adapter(): DataAdapter {
    return this.app.vault.adapter;
  }

  get tailwindPlugins() {
    return this.settings.enablePreflight ? [this.preflightPlugin] : [];
  }

  async onload() {
    try {
      await this.loadSettings();
      await this.initPreflightPlugin();
      await this.checkSnippetsDirectory();
      await this.doTailwind();
      this.registerEvent(this.vault.on("modify", () => this.doTailwind()));
      this.addSettingTab(new SettingTab(this.app, this));

      addIcon("paint-roller", paintRollerSvg);
      this.addRibbonIcon(
        "paint-roller",
        "Refresh tailwind.css snippet",
        async () => {
          try {
            await this.doTailwind();
            new Notice("Refreshed tailwind.css snippet.");
          } catch (e) {
            this.handleError(e);
          }
        },
      );
    } catch (e) {
      this.handleError(e);
    }
  }

  onunload() {}

  handleError(e: Error) {
    console.error(e);
    ERROR(e.toString());
    new Notice(e.toString());
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    await this.doTailwind();
  }

  async initPreflightPlugin() {
    const preflight = normalizePath(
      this.vault.configDir + `/plugins/${this.manifest.id}/preflight.css`,
    );
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
      ]);
    });
  }

  getTailwindContent(): string[] {
    const adapter = this.adapter;
    if (adapter instanceof FileSystemAdapter) {
      return [
        ...this.vault
          .getMarkdownFiles()
          .map((f) => adapter.getFullPath(f.path)),
        ...this.settings.contentConfig.map((glob) =>
          adapter.getFullPath(normalizePath(this.vault.configDir + "/" + glob)),
        ),
      ];
    } else {
      throw Error(
        "Adapter is not a FileSystemAdapter. Cannot continue scanning your vault for Tailwind content.",
      );
    }
  }

  async getTailwindConfig(content: string[]): Promise<TailwindConfig> {
    let theme: TailwindConfig["theme"];

    if (Boolean(this.settings.themeConfig)) {
      const themeConfigPath = normalizePath(
        this.vault.configDir + "/" + this.settings.themeConfig,
      );
      if (await this.adapter.exists(themeConfigPath)) {
        theme = JSON.parse(await this.adapter.read(themeConfigPath));
      } else {
        console.error(
          `Could not find theme configuration file at '${themeConfigPath}'.`,
        );
      }
    }

    return {
      content,
      theme,
      plugins: this.tailwindPlugins,
      corePlugins: {
        preflight: false,
      },
    };
  }

  async checkSnippetsDirectory() {
    const snippetsPath = normalizePath(this.vault.configDir + "/snippets");
    if (await this.adapter.exists(snippetsPath)) {
      return;
    } else {
      return this.adapter.mkdir(snippetsPath);
    }
  }

  async doTailwind() {
    try {
      const entryPoint = Boolean(this.settings.entryPoint)
        ? "/" + this.settings.entryPoint
        : `/plugins/${this.manifest.id}/tailwind.css`;
      const cssIn = normalizePath(this.vault.configDir + entryPoint);
      const cssOut = normalizePath(
        this.vault.configDir + "/snippets/tailwind.css",
      );

      const tailwindContent = this.getTailwindContent();
      if (tailwindContent.length === 0) {
        DEBUG("Skipping tailwind processing because there is no content.");
        return;
      }

      const postcssPlugins: AcceptedPlugin[] = [
        tailwindcss(await this.getTailwindConfig(tailwindContent)),
        autoprefixer,
      ];

      if (this.settings.addPrefixSelector) {
        // @ts-ignore
        // The postcss-prefix-selector export's return value is declared as
        // `(root: any) => string | undefined`, so it's basically like a TransformCallback.
        postcssPlugins.push(
          prefixer({
            prefix: this.settings.prefixSelector,
          }),
        );
      }

      const result = await postcss(postcssPlugins).process(
        await this.adapter.read(cssIn),
        { from: cssIn, to: cssOut },
      );

      INFO(`Overwriting ${cssOut}`);
      await this.adapter.write(cssOut, result.css);
    } catch (e) {
      this.handleError(e);
    }
  }
}

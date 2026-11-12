import {
	App,
	Editor,
	Plugin,
	PluginSettingTab,
	Setting,
	editorLivePreviewField
} from 'obsidian';
import { RangeSetBuilder } from '@codemirror/state';
import {
	Decoration,
	DecorationSet,
	EditorView,
	ViewPlugin,
	ViewUpdate
} from '@codemirror/view';

// 1. Define Settings Interface & Defaults
interface DiscordSubtextSettings {
	fontSize: number;
	textColor: string;
	hideSyntaxInLivePreview: boolean;
}

const DEFAULT_SETTINGS: DiscordSubtextSettings = {
	fontSize: 0.82,
	textColor: 'var(--text-muted)',
	hideSyntaxInLivePreview: true
};

// 2. Live Preview (Editing View) Extension Factory
const subtextLineDecoration = Decoration.line({ class: 'discord-subtext-line' });
const subtextSyntaxDecoration = Decoration.mark({ class: 'discord-subtext-syntax' });
const hideSyntaxDecoration = Decoration.replace({});

function createDiscordSubtextViewPlugin(plugin: DiscordSubtextPlugin) {
	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;

			constructor(view: EditorView) {
				this.decorations = this.buildDecorations(view);
			}

			update(update: ViewUpdate) {
				if (update.docChanged || update.viewportChanged || update.selectionSet) {
					this.decorations = this.buildDecorations(update.view);
				}
			}

			buildDecorations(view: EditorView): DecorationSet {
				const builder = new RangeSetBuilder<Decoration>();
				const isLivePreview = view.state.field(editorLivePreviewField);
				const cursorLine = view.state.doc.lineAt(view.state.selection.main.head).number;

				for (const { from, to } of view.visibleRanges) {
					for (let pos = from; pos <= to; ) {
						const line = view.state.doc.lineAt(pos);
						if (line.text.startsWith('-# ')) {
							builder.add(line.from, line.from, subtextLineDecoration);

							const shouldHide =
								plugin.settings.hideSyntaxInLivePreview &&
								isLivePreview &&
								line.number !== cursorLine;

							if (shouldHide) {
								builder.add(line.from, line.from + 3, hideSyntaxDecoration);
							} else {
								builder.add(line.from, line.from + 3, subtextSyntaxDecoration);
							}
						}
						pos = line.to + 1;
					}
				}
				return builder.finish();
			}
		},
		{
			decorations: (v) => v.decorations
		}
	);
}

// 3. Main Plugin Class
export default class DiscordSubtextPlugin extends Plugin {
	settings: DiscordSubtextSettings = { ...DEFAULT_SETTINGS };


	async onload() {
		await this.loadSettings();
		this.applyStyles();

		// Command to toggle "-# " on the active line
		this.addCommand({
			id: 'toggle-discord-subtext',
			name: 'Toggle Discord subtext (-#)',
			editorCallback: (editor: Editor) => {
				const cursor = editor.getCursor();
				const lineText = editor.getLine(cursor.line);

				if (lineText.startsWith('-# ')) {
					editor.replaceRange(
						'',
						{ line: cursor.line, ch: 0 },
						{ line: cursor.line, ch: 3 }
					);
				} else {
					editor.replaceRange('-# ', { line: cursor.line, ch: 0 });
				}
			}
		});

		// Register Live Preview extension & Reading View post-processor
		this.registerEditorExtension(createDiscordSubtextViewPlugin(this));

		this.registerMarkdownPostProcessor((element) => {
			const paragraphs = element.querySelectorAll('p');
			paragraphs.forEach((p) => {
				if (p.textContent?.startsWith('-# ')) {
					p.classList.add('discord-subtext');
					if (p.firstChild && p.firstChild.nodeType === Node.TEXT_NODE) {
						p.firstChild.textContent = p.firstChild.textContent!.replace(/^-#\s+/, '');
					}
				}
			});
		});

		// Register the Settings Tab
		this.addSettingTab(new DiscordSubtextSettingTab(this.app, this));
	}

	onunload() {
		// Clean up custom CSS variables when plugin is disabled
		document.body.style.removeProperty('--discord-subtext-size');
		document.body.style.removeProperty('--discord-subtext-color');
	}

	async loadSettings() {
		const loadedData = (await this.loadData()) as Partial<DiscordSubtextSettings> | null;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);
	}


	async saveSettings() {
		await this.saveData(this.settings);
		this.applyStyles();
	}

	applyStyles() {
		document.body.style.setProperty('--discord-subtext-size', `${this.settings.fontSize}em`);
		document.body.style.setProperty('--discord-subtext-color', this.settings.textColor);
	}
}

// 4. Settings Tab UI
class DiscordSubtextSettingTab extends PluginSettingTab {
	plugin: DiscordSubtextPlugin;

	constructor(app: App, plugin: DiscordSubtextPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Font size (em)')
			.setDesc('Relative size of the subtext compared to normal text (default: 0.82).')
			.addSlider((slider) =>
				slider
					.setLimits(0.6, 1.0, 0.02)
					.setValue(this.plugin.settings.fontSize)
					.onChange(async (value) => {
						this.plugin.settings.fontSize = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Text color')
			.setDesc('Accepts any valid CSS color (e.g., var(--text-muted), #888888, or gray).')
			.addText((text) =>
				text
					.setPlaceholder('var(--text-muted)')
					.setValue(this.plugin.settings.textColor)
					.onChange(async (value) => {
						this.plugin.settings.textColor = value.trim() || DEFAULT_SETTINGS.textColor;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Hide "-# " syntax in Live Preview')
			.setDesc('Automatically hide the "-# " prefix unless your cursor is on that line.')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.hideSyntaxInLivePreview)
					.onChange(async (value) => {
						this.plugin.settings.hideSyntaxInLivePreview = value;
						await this.plugin.saveSettings();
					})
			);
	}
}

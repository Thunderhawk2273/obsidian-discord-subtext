# Discord Subtext for Obsidian
Disclaimer: Made with assistance from AI

A lightweight Obsidian plugin that adds Discord-style `-# ` subtext formatting. Any line starting with `-# ` renders as smaller, muted text in both Live Preview and Reading View.

## Usage

Type `-# ` at the beginning of any line:

```markdown
-# This is a subtext line.
```

You can also use the Command Palette (`Ctrl/Cmd + P`) and run **Toggle Discord subtext (-#)** to add or remove the prefix on your current line. You can assign a custom hotkey to this command in **Settings > Hotkeys**.

## Settings

* **Font size (em):** Adjust the size of the subtext relative to your normal editor font (default: `0.82`).
* **Text color:** Set a custom CSS color or Obsidian CSS variable (default: `var(--text-muted)`).
* **Hide "-# " syntax in Live Preview:** Automatically hides the `-# ` prefix in Editing View unless your cursor is on that line.

## Installation

### From Community Plugins (Once Approved)
1. Open **Settings > Community Plugins** in Obsidian.
2. Disable Restricted Mode if prompted.
3. Click **Browse**, search for **Discord Subtext**, and click **Install**.
4. Enable the plugin.

### Manual Installation
1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com).
2. Create a new folder named `discord-subtext` inside your vault's `.obsidian/plugins/` directory.
3. Move the three downloaded files into that folder.
4. Reload Obsidian and enable the plugin under **Settings > Community Plugins**.



## API Documentation

See https://docs.obsidian.md

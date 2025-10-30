# 📖 ReadersParadise

> **A lightweight, cross-platform desktop manga/novel/manhua/manhwa reader**

Built with **[Tauri](https://tauri.app) + [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org/)**

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/reiwuzen/readersparadise)
[![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)](LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-2.0-orange.svg)](https://tauri.app)
[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://react.dev)

A fast, PC-focused alternative to browser-based readers with offline capabilities, customizable reading experience, and extensible source support.

⚡ **Fast** • 🖥 **Desktop-native** • 🎨 **Themable** • 📂 **Offline-ready** • 🌐 **Multi-source** • 🔌 **Extensible**

---

## ✨ Features

### 📚 Reading Experience
- **Multi-format support** - Read manga, novels, manhua, and manhwa in a unified interface
- **Browser-like tabs** - Manage multiple titles simultaneously with a familiar tab interface
- **Customizable reader** - Adjust page layouts (single/double), scroll directions (LTR, RTL, TTB, BTT), view modes, and background colors
- **Multiple reading modes** - Optimized for different content types and reading styles

### 📂 Content Sources
- **Local folder support** - Read from your local directories with automatic image sorting and organization
- **Online scraping** - Access content from configured online sources (ManhuaPlus, Mgeko, and more)
- **Extendable sources** - Add new scrapers through JSON configuration without code changes
- **Offline-first design** - Continue reading downloaded content without internet connection

### 🎨 Customization
- **Theme system** - Choose from Dark, Light, Pink, Vermilion, BlueGrey, Custom, or System themes
- **Reader preferences** - Customize background colors, image scaling, and layout options
- **Settings persistence** - All preferences saved locally with LocalStorage

### 🗂 Library Management
- **Discovery tab** - Search and discover new titles with dynamic loading
- **Library organization** - Manage your collection with favorites and tracking
- **Recent tabs** - Quick access to recently viewed series
- **Download manager** - Track download status and manage offline content
- **Series tracking** - Monitor series status (Ongoing, Stopped, Completed, Hiatus)

### 🔒 Privacy & Control
- **NSFW content toggle** - Control visibility of adult content
- **Backup & restore** - Export and import your library and settings
- **Local storage** - All data stored on your device
- **Privacy settings** - Comprehensive privacy and security controls

---

## 🛠 Tech Stack

### Frontend
- **React 19.1.0** with **TypeScript 5.8.3** - Modern, type-safe UI development
- **Vite 7.0.4** - Lightning-fast build tool and dev server
- **Zustand 5.0.8** - Lightweight state management with multiple focused stores
- **GSAP 3.13.0** - Smooth animations and transitions
- **SCSS/Sass** - Typed stylesheets for maintainable styling
- **Sonner** - Beautiful toast notifications
- **next-themes** - Seamless theme management

### Backend (Tauri/Rust)
- **Tauri 2.0** - Lightweight desktop framework (smaller than Electron)
- **Rust 2021** - Memory-safe, high-performance backend
- **reqwest** - Async HTTP client with rustls-tls
- **scraper** - Web scraping with CSS selectors
- **tokio** - Async runtime for concurrent operations
- **rayon** - Data parallelism for faster processing
- **serde/serde_json** - Serialization and deserialization

### Architecture
- **Store-based state management** - Separate stores for settings, tabs, books, downloads, and discovery
- **Plugin-based sources** - JSON-configured scrapers for easy extensibility
- **Concurrent processing** - Multi-threaded downloads and scraping
- **Image caching** - Base64 encoding and caching for performance

---

## 📋 Requirements

Make sure you have the following installed:

- [Rust](https://www.rust-lang.org/tools/install) - For Tauri backend
- [pnpm](https://pnpm.io/installation) - Package manager (or npm/yarn)

---

## 🚀 Getting Started

Clone the repository:
```bash
git clone https://github.com/yourusername/readersparadise.git
cd readersparadise
````

Install dependencies:

```bash
pnpm install
```

Run in development mode:

```bash
pnpm tauri dev
```

Build a production app:

```bash
pnpm tauri build
```

---

## 📂 Project Structure

```
readersparadise/
├── src/                          # Frontend React application
│   ├── pages/                    # Main page layouts
│   │   ├── home/                 # Home page with tab system
│   │   ├── welcome/              # Initial welcome screen
│   │   ├── sourceSelect/         # Source selection page
│   │   └── storage/              # Storage management
│   ├── components/               # React components
│   │   ├── reader/               # Reader interface & controls
│   │   ├── tabManager/           # Multi-tab system
│   │   ├── tabs/                 # Content tabs (library, discover, settings)
│   │   ├── navbar/               # Navigation bar
│   │   └── [others]/             # UI components
│   ├── store/                    # Zustand state stores
│   │   ├── useSettingsStore.ts   # App settings & preferences
│   │   ├── useTabsStore.ts       # Tab management
│   │   ├── useBookStore.ts       # Book/series data
│   │   ├── useDiscoverStore.ts   # Search & discovery
│   │   ├── useDownloadStore.ts   # Download management
│   │   └── [others].ts           # Additional stores
│   ├── hooks/                    # Custom React hooks
│   ├── types/                    # TypeScript type definitions
│   ├── helper/                   # Utility functions
│   ├── data/                     # Static data (sources.json, settings.json)
│   ├── styles/                   # Global styles and themes
│   └── App.tsx                   # Main app entry point
│
├── src-tauri/                    # Tauri Rust backend
│   ├── src/
│   │   ├── main.rs               # Backend entry point
│   │   ├── commands.rs           # Tauri commands (API endpoints)
│   │   ├── scraper.rs            # Web scraping logic
│   │   ├── local_reader.rs       # Local file system operations
│   │   └── [others].rs           # Additional modules
│   ├── Cargo.toml                # Rust dependencies
│   └── tauri.conf.json           # Tauri configuration
│
├── package.json                  # Node dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite build configuration
└── README.md                     # This file
```

---

## 🎯 Why ReadersParadise?

### vs Browser-based Readers
- **Native performance** - No browser overhead, faster page loads
- **Offline capability** - Read without internet after downloading
- **Better resource management** - Lower memory usage than browser tabs
- **Desktop integration** - System notifications, file dialogs, native feel

### vs Other Desktop Readers
- **Multi-source support** - Switch between local files and online sources seamlessly
- **Extensible architecture** - Add new sources with JSON configuration
- **Modern tech stack** - React + TypeScript + Rust for maintainability
- **Cross-platform** - Works on Windows, macOS, and Linux

### For Developers
- **Clean architecture** - Separate concerns with store-based state management
- **Type-safe** - Full TypeScript coverage for fewer runtime errors
- **Easy to extend** - Add new sources without touching core code
- **Well-structured** - Clear project organization and documentation

---

## 📖 Usage Guide

### First Launch
1. Select your preferred sources (local folders and/or online sources)
2. Configure storage locations for downloads
3. Choose your theme and reader preferences

### Reading Content
1. **From Discovery** - Search for titles and click to open
2. **From Local** - Select a folder containing manga images
3. **Multi-tab Reading** - Open multiple titles in tabs, switch between them like a browser

### Customizing Your Experience
1. Go to **Settings** tab
2. Adjust reader preferences (layout, scroll direction, image scaling)
3. Choose your theme and background colors
4. Configure sources and storage paths

### Managing Downloads
1. Download chapters for offline reading
2. Track download progress in the Downloads tab
3. Manage storage from Settings → Storage & Library

---

## 📸 Screenshots (coming soon)

<!-- Add screenshots or gifs here for a better first impression -->

---

## 🗺 Roadmap

- [ ] Complete Library tab implementation
- [ ] Add more online sources
- [ ] Implement cloud sync (optional)
- [ ] Add reading statistics and history
- [ ] Support for more file formats
- [ ] Community-driven source repository
- [ ] Mobile companion app (future consideration)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

```

Feel free to open an [issue](../../issues) for bugs, feature requests, or questions!

---

## ⚠️ Development Status

**ReadersParadise is currently in early development (v0.1.0).**

- Core reading functionality is stable and working
- Some features are still being implemented (e.g., Library tab)
- APIs and data structures may change in future versions
- Bug reports and feedback are highly appreciated!

---

## 🙏 Acknowledgments

- Built with [Tauri](https://tauri.app) for lightweight desktop applications
- Powered by [React](https://react.dev) and [TypeScript](https://www.typescriptlang.org/)
- State management by [Zustand](https://github.com/pmndrs/zustand)
- Animations by [GSAP](https://greensock.com/gsap/)
- Icons and design inspiration from the manga/manhwa community

---

## 📜 License

This project is licensed under the **Apache License 2.0** – see [LICENSE](LICENSE) for details.

---

## 📧 Contact & Support

- **Issues**: Report bugs or request features via [GitHub Issues](../../issues)
- **Discussions**: Join the conversation in [GitHub Discussions](../../discussions)
- **Contributing**: See the [Contributing](#-contributing) section above

---

<div align="center">
  <sub>Built with ❤️ by the ReadersParadise team</sub>
</div>

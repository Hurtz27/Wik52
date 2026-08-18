# 📅 Wik52

<div align="center">

![Wik52 Version](https://img.shields.io/badge/version-0.1.1-blue.svg?style=flat-square)
![Platform](https://img.shields.io/badge/platform-Windows%2011%20%7C%2010-0078D4.svg?style=flat-square&logo=windows)
![Installer Size](https://img.shields.io/badge/installer%20size-%3C%202%20MB-10B981.svg?style=flat-square)
![Tauri v2](https://img.shields.io/badge/built%20with-Tauri%20v2%20%2B%20React%2019-7C3AED.svg?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-slate.svg?style=flat-square)

**The ultra-lightweight corporate calendar, ISO week tracker, and world time zone planner for Windows.**

</div>

---

## 🌟 Overview

**Wik52** is a fast, elegant, and native desktop calendar designed for managers, engineers, supply chain specialists, and global corporate teams. It places critical business context—such as **ISO 8601 week numbers**, **multi-country public holidays**, and **cross-continental office time zones**—right at your fingertips without bloat.

Packaged in an installer under **2 MB** and consuming near-zero background memory, **Wik52** hugs the Windows taskbar with native Windows 11 Fluent glassmorphism.

---

## ✨ Key Features

### 1. 🔢 Dynamic Taskbar Tray Week Indicator
- Displays the **current week number** directly inside the Windows taskbar system tray in real time.
- **3 Customizable Styles**: *Accent Badge*, *Calendar Flip*, and *Minimalist*.
- High-contrast, large bold font for crystal-clear readability at standard 16–32px taskbar sizes.

### 2. 🗓️ 52-Week Year & ISO Week Matrix
- Full annual 52-week breakdown organized across fiscal quarters (**Q1 – Q4**).
- Jump directly to any week or copy formatted week ranges (e.g. `Week 34 (Aug 17 – Aug 23, 2026)`) with a single click.
- Configurable first day of week: **Monday (ISO 8601 Standard)** or **Sunday (US / Americas)**.

### 3. 🌐 Global Time Zones & Working Hours Heatmap
- Track time across distributed international offices (US, Mexico, Canada, Italy, UK, Japan, Australia, etc.).
- **Interactive Time Scrubber**: Drag through 24 hours to instantly see corresponding local times across all time zones.
- Real-time **Open / Closed Working Hours** status indicators (e.g. `8:00 AM – 5:00 PM`).

### 4. 🌍 Multi-Country Statutory Holidays
- Integrated statutory and optional holiday datasets for:
  - 🇺🇸 **United States**
  - 🇲🇽 **Mexico**
  - 🇨🇦 **Canada**
  - 🇮🇹 **Italy**
- Filter by holiday category (*Public Statutory*, *Optional / Cultural*, *Observances*).
- Country initials (`US`, `MX`, `CA`, `IT`) displayed cleanly on day cells.

### 5. 📝 Notes & Scheduled Reminders
- Add daily notes and weekly sprint milestones.
- Set scheduled reminders with alarms and visual alerts.
- **Smart Notification Lights**: Top-right amber dot for active reminders and green dot for daily notes.
- Amber light turns off automatically as soon as all reminders for the day are checked (`✅`).
- Edit, mark complete, or delete items in-place.

### 6. 🪟 3 Adaptive Window Modes
- **Full Flyout Mode ($430\text{px} \times 690\text{px}$)**: Complete view with Week Hero Banner, Calendar, 52-Week Year, and World Time Zones.
- **Compact View ($325\text{px} \times 268\text{px}$)**: Minimalist distraction-free calendar hugging the taskbar.
- **Floating Desktop Pill Widget**: Ultra-compact pinned desktop widget showing time and current week.

### 7. 💾 Update-Safe Persistent Storage
- All settings, notes, custom time zones, and reminders are saved to `%APPDATA%\com.wik52.app\wik52_config.json`.
- **100% Preserved Across Updates**: Updating or reinstalling the application never overwrites your notes or preferences.
- Built-in one-click button in Settings to open the data folder in Windows Explorer for manual backups.

---

## 📥 Installation

Download the latest release from the [GitHub Releases](https://github.com/Hurtz27/Wik52/releases) page:

- **NSIS Setup Installer (`Wik52_0.1.1_x64-setup.exe`)** — Fast guided Windows installer (~1.8 MB).
- **MSI Enterprise Package (`Wik52_0.1.1_x64_en-US.msi`)** — For enterprise/GPO deployment (~2.3 MB).

---

## 🛠️ Development & Building from Source

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Rust & Cargo](https://www.rust-lang.org/tools/install) (latest stable)
- Microsoft Visual Studio C++ Build Tools (MSVC)

### Clone & Install
```bash
# Clone the repository
git clone https://github.com/Hurtz27/Wik52.git
cd Wik52

# Install frontend dependencies
npm install
```

### Run in Development Mode
```bash
npm run tauri dev
```

### Build Production Release
```bash
npm run tauri build
```
The compiled binaries and installers will be generated under `src-tauri/target/release/bundle/`.

---

## ⌨️ Keyboard Shortcuts & Quick Tips
- **`Esc`**: Instantly closes any open modal (Add Note, Add Reminder, Add Time Zone, Settings).
- **`Right-Click` on any calendar day or week**: Opens quick context menu to create notes or reminders.
- **`📌 Pin` in Title Bar**: Keeps Wik52 always on top of all application windows.

---

## 📄 License
This project is licensed under the MIT License.

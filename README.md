# Shizen

A minimalist, local-first personal management application inspired by Japanese harmony. Shizen provides a calm, distraction-free environment to manage your accounts, clipboard, and notes without external dependencies.

![Shizen Logo](resources/logo-shizen-sf.png)

**Current Version: 1.1** - Focus on refinement and user experience improvements

## 🌸 Philosophy

Shizen (自然) means "nature" or "natural" in Japanese. This application embodies the principles of simplicity, fluidity, and balance—creating a personal space where technology and tranquility meet.

## ✨ Features

- **🔐 Account Management**: Securely store and organize your credentials with category-based autocomplete
- **📋 Clipboard Manager**: Automatic clipboard history with temporary and permanent storage
- **📝 Notes**: Create and manage personal notes with a clean interface
- **⏰ Timer**: Pomodoro and custom timers with configurable sound notifications
- **🎨 Dark Theme**: Elegant dark mode design for comfortable extended use
- **💾 Local Storage**: All data stored locally in JSON format—no cloud, no tracking
- **🔒 Privacy First**: Complete offline functionality, your data never leaves your device
- **📦 Portable**: Export and import your data as JSON files
- **🖼️ Profile Customization**: Upload and crop your profile picture with an intuitive interface

## 🚀 Getting Started

### Option 1: Use Online (Recommended)

Visit the live application at: **[https://lucaslr2.github.io/Shizen/](https://lucaslr2.github.io/Shizen/)**

No installation required! Just open the link and start using Shizen directly in your browser.

### Option 2: Run Locally

If you prefer to run Shizen on your own machine:

1. Clone the repository:
```bash
git clone https://github.com/lucaslr2/shizen.git
cd shizen
```

2. Open `index.html` in your web browser

That's it! Shizen runs entirely in your browser with no server required.

## 📖 Usage

### First Time Setup

1. Open Shizen in your browser
2. Choose one of two options:
   - **Create Account**: Set up a new profile with your name and photo
   - **Load Account**: Import an existing JSON data file

### Creating Your Profile

1. Enter your full name
2. Upload a profile picture and use the cropping tool to adjust it
3. Select which tools you want to enable (Accounts, Clipboard, Notes)
4. Click "Crear cuenta" - your data file will be automatically exported

### Managing Accounts

- Click **"Nueva cuenta"** to add new credentials
- Use the autocomplete feature to group accounts by category
- Categories show a badge with the count of accounts in that group
- Toggle accounts active/inactive using the power button
- Copy usernames and passwords with one click
- Add optional notes for additional context (2FA codes, security questions, etc.)
- Edit or delete accounts as needed

### Managing Clipboard

- **Automatic Detection**: Everything you copy is automatically captured and stored
- **Temporary History**: Up to 50 recent items stored during your session
- **Permanent Saved**: Save important items to keep them across sessions
- **Smart Type Detection**: Automatically identifies URLs, emails, code, numbers, and text
- **Tab Navigation**: Switch between temporary and saved items with ease
- Copy any item back to your clipboard with one click
- Temporary items are cleared when you log out
- Only saved items are included in JSON exports

### Managing Notes

- Create quick text notes for reminders, ideas, and information
- Edit or delete notes at any time
- Notes automatically display relative timestamps (Today, Yesterday, etc.)

### Using the Timer

- **Quick Modes**: Pomodoro (25min), Short Break (5min), Long Break (15min)
- **Custom Timer**: Set your own minutes and seconds
- **Sound Notifications**: Choose from 6 different notification sounds (Bell, Beep, Chime, Ding, Digital, Soft)
- **System Alerts**: Receive browser notifications even when on other tabs (requires permission)
- **Visual Feedback**: Discord-style notification and page title flash when timer completes
- **Session Tracking**: Tracks completed sessions per day
- **Sound plays 3 times** when timer finishes to ensure you don't miss it
- All timer settings (sound type and mute state) are saved in your JSON exports

### Data Management

**Exporting Data:**
- Click your profile picture in the header → **"Exportar datos"**
- Save the JSON file in a secure location
- This file contains all your accounts, notes, and settings

**Loading Data:**
- From the welcome screen, choose "Cargar cuenta"
- Drag and drop your JSON file or click to browse
- Your profile and all data will be restored

## 🔒 Security & Privacy

### Important Security Notes

- Shizen stores data in browser sessionStorage during your session
- **Your passwords are stored in plain text in the JSON export files**
- This is a local-first tool designed for convenience, not enterprise-level security
- Never share your JSON export files with others
- Store your exports in a secure location (encrypted drive, password manager, etc.)

### Recommendations

- Use Shizen on your personal device only
- Consider encrypting your JSON exports with tools like GPG or 7-Zip
- For sensitive accounts, consider using a dedicated password manager
- Always export your data before closing your session
- Use the "Cerrar sesión" button to clear sessionStorage when done

### Privacy

- No analytics, tracking, or telemetry
- No internet connection required (except for loading fonts and icons)
- All data processing happens locally in your browser
- No accounts, no sign-ups, no servers

## 🎨 Customization

Shizen uses CSS custom properties for easy theming. Edit the CSS files to customize:

**`css/shizen-styles.css` or `css/login-styles.css`:**
```css
:root {
    --accent-primary: #FF5252;      /* Main accent color */
    --accent-secondary: #81C784;    /* Secondary accent */
    --bg-primary: #121212;          /* Background color */
    /* ... and many more variables */
}
```

You can modify:
- Accent colors and gradients
- Background colors
- Spacing and typography
- Border radius and shadows
- Transitions and animations

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Custom CSS with CSS Variables
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Storage**: Browser SessionStorage + JSON Export
- **Fonts**: [Inter](https://fonts.google.com/specimen/Inter) from Google Fonts

## 📁 Project Structure

```
shizen/
├── index.html              # Login/Welcome page
├── shizen.html            # Main dashboard
├── css/
│   ├── login-styles.css   # Styles for welcome page
│   └── shizen-styles.css  # Styles for dashboard
├── js/
│   ├── login.js           # Authentication and profile setup
│   └── shizen.js          # Dashboard functionality
└── resources/
    ├── logo-shizen-sf.png
    └── background-login.jpg
```

## 🎯 Roadmap

### Version 1.1 (Current) - Polish & Refinement
Focus on improving user experience and fixing annoying issues:

**Privacy & Security Improvements:**
- [ ] Hide sensitive data from clipboard history (passwords copied from Account Manager)
- [ ] Implement clipboard detection filters to exclude password fields
- [ ] Add option to manually exclude clipboard items retroactively

**Permission & State Management:**
- [ ] Fix clipboard permission bug (stop asking repeatedly after approval)
- [ ] Persistent permission state across sessions
- [ ] Better permission error handling and user feedback
- [ ] Cache permission states in localStorage

**User Experience Enhancements:**
- [ ] Add confirmation dialogs for destructive actions (delete account, clear clipboard)
- [ ] Improve form validation with real-time feedback
- [ ] Add keyboard shortcuts for common actions (Ctrl+N for new note, etc.)
- [ ] Better mobile responsiveness and touch interactions
- [ ] Add loading states for async operations

**Performance Optimizations:**
- [ ] Optimize clipboard monitoring to reduce CPU usage
- [ ] Lazy load components for faster initial page load
- [ ] Debounce search and filter operations
- [ ] Reduce unnecessary re-renders

**UI/UX Polish:**
- [ ] Smoother transitions and animations
- [ ] Toast notifications for user actions (copied, saved, deleted)
- [ ] Empty state illustrations for sections with no data
- [ ] Better visual hierarchy in account cards
- [ ] Improved color contrast for accessibility

### Version 1.2 - Feature Expansion
- [ ] Search and advanced filter functionality for accounts
- [ ] Bulk operations (select multiple accounts/notes)
- [ ] Import/export individual sections (only accounts, only notes, etc.)
- [ ] Account tags and advanced categorization
- [ ] Note markdown support with preview

### Version 1.3 - Extended Functionality
- [ ] Configuration page with customizable settings
- [ ] Profile page with detailed user preferences
- [ ] Shop section for themes and extensions
- [ ] Backup scheduling and auto-export
- [ ] Password strength indicator and generator

### Version 2.0 - Major Evolution
- [ ] Optional encryption for JSON exports
- [ ] Browser extension for quick access
- [ ] Sync between devices (optional, privacy-focused)
- [ ] Plugin system for community extensions
- [ ] Advanced analytics and insights dashboard

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Areas for Contribution

- Bug fixes and improvements from the v1.1 roadmap
- New features from future versions
- UI/UX enhancements
- Documentation improvements
- Translations to other languages
- Accessibility improvements

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by Japanese design philosophy and the concept of "Ma" (間) - negative space
- Built with a focus on privacy, simplicity, and user autonomy
- Icons by [Lucide](https://lucide.dev/)
- Font by [Inter](https://rsms.me/inter/)

## 📧 Support

If you encounter any issues or have suggestions:
- Open an issue on GitHub
- Check existing issues before creating a new one
- Provide as much detail as possible (browser, OS, steps to reproduce)

## ⚠️ Disclaimer

Shizen is a personal project designed for convenience and local data management. It is not intended to replace professional password managers for highly sensitive information. Use at your own discretion and always maintain secure backups of your data.

---

**Made with 🌸 by embracing simplicity and nature**

> "Simplicity is the ultimate sophistication." - Leonardo da Vinci
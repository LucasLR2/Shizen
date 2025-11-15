# Shizen

A minimalist, local-first personal management application inspired by Japanese harmony. Shizen provides a calm, distraction-free environment to manage your accounts, clipboard, and notes without external dependencies.

![Shizen Logo](resources/logo-shizen-sf.png)

**Current Version: 1.1**

## Philosophy

Shizen (自然) means "nature" or "natural" in Japanese. This application embodies the principles of simplicity, fluidity, and balance—creating a personal space where technology and tranquility meet.

## Features

- **Account Management**: Securely store and organize your credentials with category-based autocomplete
- **Clipboard Manager**: Automatic clipboard history with temporary and permanent storage
- **Notes**: Create and manage personal notes with a clean interface
- **Timer**: Pomodoro and custom timers with configurable sound notifications
- **Dark Theme**: Elegant dark mode design for comfortable extended use
- **Local Storage**: All data stored locally in JSON format—no cloud, no tracking
- **Privacy First**: Complete offline functionality, your data never leaves your device
- **Portable**: Export and import your data as JSON files
- **Profile Customization**: Upload and crop your profile picture with an intuitive interface

## Getting Started

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

## Usage

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
- Click the hamburger menu in the header and select **"Exportar datos"**
- Save the JSON file in a secure location
- This file contains all your accounts, notes, and settings

**Loading Data:**
- From the welcome screen, choose "Cargar cuenta"
- Drag and drop your JSON file or click to browse
- Your profile and all data will be restored

## Security & Privacy

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

## Customization

Shizen uses CSS custom properties for easy theming. Edit the CSS files to customize:

**`css/core.css` or `css/login-styles.css`:**
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

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Custom CSS with CSS Variables
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Storage**: Browser SessionStorage + JSON Export
- **Fonts**: [Inter](https://fonts.google.com/specimen/Inter) from Google Fonts

## Project Structure

```
shizen/
├── index.html              # Login/Welcome page
├── shizen.html            # Main dashboard
├── README.md              # Project documentation
├── css/
│   ├── core.css           # Core styles and CSS variables
│   ├── login-styles.css   # Styles for welcome page
│   ├── components/        # Reusable component styles
│   │   ├── header.css
│   │   ├── sidebar.css
│   │   └── modals.css
│   └── sections/          # Section-specific styles
│       ├── dashboard.css
│       ├── accounts.css
│       ├── notes.css
│       ├── clipboard.css
│       ├── timer.css
│       ├── profile.css
│       └── help.css
├── js/
│   ├── core.js            # Core functionality and initialization
│   ├── utils.js           # Utility functions
│   ├── login.js           # Authentication and profile setup
│   ├── accounts.js        # Account management module
│   ├── clipboard.js       # Clipboard manager module
│   ├── notes.js           # Notes module
│   ├── timer.js           # Timer/Pomodoro module
│   └── help.js            # Help/FAQ functionality
└── resources/
    ├── logo-shizen-sf.png
    ├── flor-shizen-64-sf.png
    └── background-login.jpg
```

## Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Areas for Contribution

- Bug fixes and improvements
- New features and enhancements
- UI/UX improvements
- Documentation updates
- Translations to other languages
- Accessibility improvements

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Inspired by Japanese design philosophy and the concept of "Ma" (間) - negative space
- Built with a focus on privacy, simplicity, and user autonomy
- Icons by [Lucide](https://lucide.dev/)
- Font by [Inter](https://rsms.me/inter/)

## Support

If you encounter any issues or have suggestions:
- Open an issue on GitHub
- Check existing issues before creating a new one
- Provide as much detail as possible (browser, OS, steps to reproduce)

## Disclaimer

Shizen is a personal project designed for convenience and local data management. It is not intended to replace professional password managers for highly sensitive information. Use at your own discretion and always maintain secure backups of your data.

---

**Made with nature by embracing simplicity**

> "Simplicity is the ultimate sophistication." - Leonardo da Vinci
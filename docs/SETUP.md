# JeetMantra Implementation - Setup Guide

## Quick Start

### 1. Run Locally (5 seconds)
```bash
cd /home/claude/repo
python3 -m http.server 3000 --bind 0.0.0.0
```

Then open in your browser:
- **Website:** http://localhost:3000/website.html
- **Dashboard:** http://localhost:3000/dashboard.html

No build tools, dependencies, or installation needed.

### 2. Deploy to Production

The standalone HTML files can be deployed to any static hosting:
- GitHub Pages
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any basic web server

No special server-side code required.

## File Structure

```
/
├── website.html          # Website prototype (216 KB, standalone)
├── dashboard.html        # Dashboard prototype (301 KB, standalone)
├── README.md             # Project overview
├── SETUP.md              # This file
├── .gitignore            # Git ignore rules
└── project/              # Original design files
    ├── ui_kits/          # Design system components
    ├── assets/           # Design assets (logos, images)
    ├── colors_and_type.css
    └── README.md
```

## Features

### Website (`website.html`)
- ✅ Home page with hero and featured courses
- ✅ Courses catalog with filtering
- ✅ Earn page showing earning opportunities
- ✅ About & Contact pages
- ✅ Directory with teacher/partner search and filtering
- ✅ Login page with 3 authentication methods:
  - ID + Password
  - Phone + OTP
  - Google Sign-in

### Dashboard (`dashboard.html`)

#### Student Portal
- Overview with stats and quick actions
- Course catalog with progress tracking
- Attendance calendar and streak tracking
- Digital wallet and transactions
- User profile and achievements

#### Teacher Portal
- Dashboard with today's classes and schedule
- Class management and attendance marking
- Live class capabilities
- Course creation wizard (4-step form)
- Payment tracking and withdrawal
- Referral and student management

#### Partner Portal
- Booking and revenue dashboard
- Session management and attendance
- Service listing and management
- Live session capabilities
- Payment tracking with withdrawal options
- Referral and student tracking

## Customization

### Theme & Colors
In `dashboard.html`, look for the `ACCENTS` object to modify color schemes:
```javascript
const ACCENTS = [
  { name: 'Teal', primary: '#0d9488', accent: '#f97316' },
  // More color schemes...
];
```

### Language Support
Supports: English (en), Hindi (hi), Hinglish (hi_en)
Change via the Settings panel in dashboard.

### Dark Mode
Toggle dark mode via the Settings panel or programmatically via CSS class: `document.body.classList.toggle('dark')`

## Development Notes

- **Framework:** React 18 with Babel standalone
- **Styling:** CSS variables for theming, responsive design
- **No dependencies:** All libraries loaded via CDN
- **Browser support:** Modern browsers (ES6+)
- **Testing:** Puppeteer scripts in `/tmp/` for automated testing

## Deploying to GitHub Pages

```bash
# 1. Create new GitHub repository (jeetmantra or similar)
# 2. Add remote
git remote add origin https://github.com/YOUR_USERNAME/jeetmantra.git

# 3. Push
git branch -M main
git push -u origin main

# 4. Enable GitHub Pages in repo settings
# Choose: main branch / root directory

# Files will be available at:
# https://YOUR_USERNAME.github.io/jeetmantra/website.html
# https://YOUR_USERNAME.github.io/jeetmantra/dashboard.html
```

## Testing

Automated browser testing scripts are available in `/tmp/`:
- `runtest.js` - Basic rendering test
- `runtest2.js` - Rendering with CDN interception
- `runtest3.js` - Interactive flow tests
- `test_interactions.js` - Comprehensive interaction testing

Run any test:
```bash
node /tmp/test_interactions.js
```

## Support & Issues

All interactive components have been tested and verified working:
- ✅ Navigation between all pages
- ✅ Role selection and switching
- ✅ Form inputs and interactions
- ✅ Tab switching and state management
- ✅ 0 JavaScript errors

If you encounter any issues, verify:
1. HTTP server is running (`python3 -m http.server 3000`)
2. Browser is up-to-date (ES6+ support required)
3. Check browser console for any errors

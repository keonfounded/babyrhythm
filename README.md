# BabyRhythm

**Smart baby tracking for modern parents** — Track sleep, feeds, diapers, and more with intelligent predictions and beautiful analytics.

---

## Screenshots

<!-- Add screenshots here -->
| Schedule | History | Milestones | Doctor Visit | Profile |
|----------|---------|------------|--------------|---------|
| ![Schedule](screenshots/schedule.png) | ![History](screenshots/history.png) | ![Milestones](screenshots/milestones.png) | ![Doctor](screenshots/doctor.png) | ![Profile](screenshots/profile.png) |

---

## Features

### Core Tracking
Track all essential baby events with detailed information:

- **Sleep** — Duration, quality rating, location (crib, stroller, car, etc.)
- **Feeding** — Bottle, breast, solids, or snack with amounts and duration
- **Diapers** — Wet, dirty, or both with rash tracking
- **Pumping** — Side, amount (oz/ml), and duration
- **Medication** — Name and dosage tracking
- **Notes** — Free-form logging for anything else

### Intelligent Predictions
ML-powered predictions learn from your baby's unique patterns:

- **Nap Predictions** — Know when baby will be tired based on wake windows
- **Feed Predictions** — Anticipate hunger before the fussing starts
- **Weighted Recency** — Recent patterns weighted more heavily
- **Day/Night Awareness** — Different predictions for day vs night
- **Confidence Scores** — See how reliable each prediction is (0-100%)
- **Nap Transition Detection** — Automatically detects 4→3→2→1 nap transitions
- **Circadian Adjustments** — Predictions adapt to natural sleep rhythms
- **Trend Indicators** — See if patterns are shifting earlier or later

### Analytics & Insights
Beautiful charts and actionable insights:

- **Growth Charts** — WHO percentile curves, sex-specific, toggle kg/lbs
- **Daily Summary** — At-a-glance view of today's events with trends
- **Weekly Summary** — Week-over-week comparisons
- **Sleep Analytics** — Total sleep, night wakings, sleep efficiency
- **Feed Analytics** — Daily intake, feeding frequency, patterns
- **Diaper Analytics** — Track output patterns

### Milestone Tracking
40+ predefined developmental milestones across categories:

- **Motor Skills** — 15 milestones (rolling, sitting, crawling, walking...)
- **Social & Emotional** — 10 milestones (first smile, stranger anxiety...)
- **Language & Communication** — 8+ milestones (cooing, first words...)
- **Cognitive** — 8+ milestones (object permanence, cause/effect...)
- **Custom Milestones** — Add your own special moments
- **CSV Export** — Download milestone history

### Doctor Visit Mode
Generate comprehensive reports for pediatrician visits:

- **Configurable Periods** — 1, 2, or 4 week reports
- **Complete Analytics** — Sleep, feed, and diaper summaries
- **Patient Summary** — Growth percentiles at a glance
- **Concerns Field** — Note questions for the doctor
- **Print Ready** — Clean print formatting
- **CSV Export** — Share data electronically

### Caregiver Sharing
Share tracking data with partners, grandparents, or nannies:

- **QR Code Sharing** — Scan to import on another device
- **Link Sharing** — Copy shareable link to clipboard
- **Configurable Range** — Share 7, 14, or 30 days of data
- **Import Options** — Merge with existing data or replace

### Data & Backup
Your data is safe and portable:

- **Google Drive Backup** — Automatic cloud backup
- **JSON Export/Import** — Full data portability
- **LocalStorage** — Works offline, data persists
- **Storage Migration** — Seamless upgrades between versions

### User Experience
Thoughtfully designed for sleep-deprived parents:

- **5-Tab Navigation** — Schedule, History, Milestones, Doctor, Profile
- **Dark/Light Theme** — Easy on the eyes at 3am
- **Demo Mode** — Try with sample data before committing
- **Push Notifications** — Personalized reminders
- **PWA Support** — Install on home screen, works offline
- **Onboarding Wizard** — 4-step setup for new users
- **Interactive Tutorial** — Learn features with guided overlay
- **Undo/Redo** — Easily fix mistakes

### Schedule & Timeline
A beautiful, functional daily view:

- **24hr+ Timeline** — Continuous scrollable view
- **Quick Log Toolbar** — Fast event entry on mobile and desktop
- **Caregiver Duty Blocks** — Track Mom/Dad shift handoffs
- **Drag & Drop** — Edit events by dragging
- **Calendar View** — Jump to any date

---

## Tech Stack

- **Framework** — React 18 with TypeScript
- **Build Tool** — Vite
- **Styling** — Tailwind CSS
- **State** — Zustand
- **Charts** — Recharts
- **PWA** — Vite PWA Plugin
- **Testing** — Vitest

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/babyrhythm.git
cd babyrhythm

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Demo Mode
Click "Try Demo" on the welcome screen to explore with sample data.

---

## Version History

### v1.0.0 (February 2025)
**Initial Release** — Full-featured baby tracking app

#### Core Features
- Sleep, feed, diaper, pump, medication, and note tracking
- ML-based nap and feed predictions
- Growth charts with WHO percentiles
- 40+ developmental milestones
- Doctor visit report generator
- Caregiver sharing via QR code and links

#### Data & Sync
- Google Drive backup integration
- JSON export/import
- LocalStorage persistence

#### User Experience
- Dark/light theme
- PWA with offline support
- Push notifications
- 4-step onboarding wizard
- Interactive tutorial
- Undo/redo support

---

## Roadmap

### Under Consideration
- **Activity Tracking** — Tummy time, play time, outdoor time
- **Illness Log** — Symptoms, temperature tracking
- **Vaccination Schedule** — Immunization tracking and reminders
- **Sleep Score** — Daily quality score based on patterns
- **Breast Milk Inventory** — Storage tracking with expiration dates
- **Real-time Partner Sync** — Cloud sync between devices
- **Multiple Baby Support** — Twins and siblings
- **Widget Support** — iOS/Android home screen widgets
- **Voice Logging** — Siri/Google Assistant integration

---

## License

MIT License — See [LICENSE](LICENSE) for details.

---

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---

<p align="center">
  Made with love for tired parents everywhere
</p>

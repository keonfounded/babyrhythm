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
45+ predefined developmental milestones based on CDC 2022 guidelines:

- **Motor Skills** — Rolling, sitting, walking, running...
- **Social & Emotional** — First smile, stranger anxiety, pretend play...
- **Language & Communication** — Cooing, babbling, first words, phrases...
- **Cognitive** — Object permanence, stacking, puzzles...
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

## Data Sources & Medical Disclaimer

BabyRhythm uses data from reputable medical organizations:

| Data | Source |
|------|--------|
| Growth Charts | [WHO Child Growth Standards](https://www.who.int/tools/child-growth-standards) |
| Milestones | [CDC "Learn the Signs. Act Early" (2022)](https://www.cdc.gov/act-early/milestones/index.html) |
| Sleep Guidelines | [AASM Sleep Duration Recommendations](https://pmc.ncbi.nlm.nih.gov/articles/PMC4877308/) |
| Wake Windows | [Cleveland Clinic](https://health.clevelandclinic.org/wake-windows-by-age), [Sleep Foundation](https://www.sleepfoundation.org/baby-sleep/newborn-wake-windows) |
| Feeding Guidelines | [AAP Breastfeeding](https://www.aap.org/en/patient-care/newborn-and-infant-nutrition/newborn-and-infant-breastfeeding/) |

**Important:** BabyRhythm is an informational tool only, NOT a substitute for medical advice. Predictions are estimates based on patterns. Always consult your pediatrician for health concerns.

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

### v1.0.1 (February 2025)
**Data Accuracy & Documentation Update**

#### Data Sources Updated
- Milestones updated to CDC 2022 guidelines (75th percentile standard)
- Wake windows revised to align with Cleveland Clinic/Sleep Foundation guidance
- Added proper citations to WHO, AAP, CDC, and AASM sources

#### Medical Disclaimers Added
- Onboarding disclaimer ("Not medical advice")
- Prediction disclaimers on nap/feed estimates
- Growth chart disclaimer (screening tool, not diagnosis)
- Milestone disclaimer (guidelines, not deadlines)
- Full medical disclaimer in Profile settings

#### Documentation
- Comprehensive README with feature documentation
- Strategic roadmap (ROADMAP.md) for v2/v3 planning
- Data accuracy audit report (AUDIT_REPORT.md)

---

### v1.0.0 (February 2025)
**Initial Release** — Full-featured baby tracking app

#### Core Features
- Sleep, feed, diaper, pump, medication, and note tracking
- ML-based nap and feed predictions
- Growth charts with WHO percentiles
- 45+ developmental milestones
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

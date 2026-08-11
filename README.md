# Job Triangle Tracker

Job Triangle Tracker is a single-page web app for managing job applications across a 5-stage pipeline:

1. Applied
2. Screening
3. Interview
4. Offer
5. Closed

It includes a dynamic triangle water-fill visualization, reminders for upcoming/overdue next actions, stale stage flags, and core job search analytics.

## Project Structure

```text
/
├── index.html
├── README.md
├── css/
│   ├── styles.css
│   └── triangle.css
└── js/
    ├── app.js
    ├── firebase-config.js
    ├── storage.js
    ├── ui.js
    ├── triangle.js
    └── analytics.js
```

## Run Locally

Because this app uses ES modules, run it from a local static server (instead of opening `index.html` directly):

```bash
cd /path/to/Job-tracker-triangle
python3 -m http.server 8080
```

Then open:

- `http://localhost:8080`

## Deploy Quickly (Netlify / Vercel)

You can deploy this as a static site:

1. Push the repository to GitHub.
2. In Netlify or Vercel, create a new project from the repository.
3. Keep default static settings (no build command required).
4. Deploy.

Or drag-and-drop the project folder directly into Netlify Drop for instant hosting.

## Firebase Firestore Setup (Optional but Recommended)

The app automatically falls back to `localStorage` when Firebase is not configured.

### 1) Create a Firebase project

- Go to [Firebase Console](https://console.firebase.google.com/)
- Create a new project
- Add a Web app to the project

### 2) Enable Firestore

- In Firebase Console, open **Firestore Database**
- Create database (start in test mode for development)

### 3) Update configuration

Edit `/js/firebase-config.js` and replace all placeholder values in `firebaseConfig`:

- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`

Once configured, the app will use Firestore automatically.

## Job Triangle Methodology

The Job Triangle method treats your job search as a flow system:

- **Bottom tiers** (Applied, Screening) represent volume and top-of-funnel activity.
- **Middle tiers** (Interview) represent validation and momentum.
- **Top tiers** (Offer, Closed) represent conversion and outcome quality.

Use analytics and alerts together:

- Track response and conversion rates.
- Flag stale applications stuck in stage.
- Prioritize overdue follow-ups to improve pipeline movement.

## Data Fields Tracked

Each application record includes:

- `id`
- `company`
- `role`
- `dateApplied`
- `source`
- `status`
- `nextAction`
- `dueDate`
- `updatedAt`
- `notes`

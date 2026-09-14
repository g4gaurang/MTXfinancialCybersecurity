# MTX Financial Cybersecurity

Interactive landing\-page prototype for explainable financial\-integrity and tax\-compliance decision support for public\-revenue agencies.

## Local setup

```bash
npm install
npm run dev
```

Production checks:

```bash
npm run lint
npm run build
npm run preview
```

The project uses React, TypeScript, Vite, Lucide icons, and Recharts. It has no backend, database, authentication, production integrations, or external API calls.

## Product maturity

### Initial release represented in the prototype

* Synthetic demonstration data
* Case intake and prioritized analyst queue
* Configurable signals with source and legal\-basis records
* Explainable scoring and evidence review
* Analyst disposition, human approval, and audit history
* Illustrative numeric\-pattern checks
* Draft summary and correspondence assistance

### Planned, potential, or subject to agency approval

* Agency\-approved data connections
* Outreach tracking
* Entity resolution and relationship analysis
* Coordinated\-activity visualization
* Path recommendations
* Taxpayer correction or response channel
* Expanded model monitoring

Planned capabilities are labeled in the interface and are not presented as current production capabilities.

## Synthetic\-data and responsible\-AI safeguards

The interface uses local, fictional records and illustrative metrics. It contains no taxpayer names, tax identifiers, account details, real agency names, or claimed agency outcomes. Priority labels describe review order rather than findings.

Signals retain source, date, purpose, quality, and limitation context. AI\-assisted content is framed as draft preparation using approved evidence and templates. Authorized agency staff remain responsible for taxpayer\-affecting actions. The prototype cannot open an audit, send correspondence, or execute a referral.

## Platform and deployment

The product is presented as deployable in an agency\-approved cloud, private, sovereign, on\-premises, or hybrid environment. Integrations may use APIs, events, message queues, secure files, approved middleware, or batch processing. Analytical and AI components are selectable or replaceable based on agency architecture and governance.

Vite uses `/MTXfinancialCybersecurity/` as its base path, matching the repository name. Static assets are relative to that base. The prototype uses in\-page anchors and does not require client\-side route fallback handling.

GitHub Pages deployment is defined in `.github/workflows/deploy-pages.yml`. In repository settings, select **GitHub Actions** as the Pages source. A push to `main` or a manual workflow run then builds and publishes `dist`.

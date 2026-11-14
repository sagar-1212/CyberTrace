# CyberTrace
### Financial Crime Intelligence & Predictive Analytics Platform

Cybertrace is a full-stack financial intelligence platform designed to analyse suspicious financial transactions, identify potential money mule networks, trace multi-hop money movement and predict possible ATM cash withdrawal locations using machine learning and geospatial analytics.

The platform combines graph-based transaction analysis, predictive modelling, interactive visualizations and investigation management to support financial crime analysis and decision-making.

## Overview

Financial fraud often involves multiple accounts and transactions through which funds are transferred, layered and eventually withdrawn. Identifying these patterns manually can be time-consuming and challenging.

CyberTrace aims to simplify this process by providing a unified environment for analysing transaction networks, identifying suspicious account relationships, examining geographic patterns and generating predictive insights.

## Key Features

### 1. Financial Crime Dashboard
- Overview of financial crime activity.
- Complaint and investigation statistics.
- Suspicious transaction indicators.
- Risk summaries and analytical visualizations.

### 2. Complaint Management
- Register and manage financial cybercrime complaints.
- Track complaint details and fraud amounts.
- Monitor investigation status.
- Organize complaint-related information.

### 3. Transaction Analysis
- Analyse financial transaction records.
- Trace multi-hop movement of funds.
- Identify suspicious transaction patterns.
- Examine account-to-account relationships.

### 4. Graph-Based Money Mule Detection
- Visualize interconnected financial accounts.
- Analyse transaction networks.
- Identify potential money mule accounts.
- Apply graph analytics and centrality measures.
- Examine suspicious fund movement patterns.

### 5. Predictive ATM Withdrawal Analytics
- Rank potential ATM withdrawal locations.
- Analyse geographic proximity and transaction patterns.
- Use spatial and temporal features.
- Generate candidate risk scores.
- Provide analytical insights into potential cash withdrawal activity.

### 6. Geospatial Intelligence
- Interactive map-based visualization.
- Display ATM locations.
- Visualize geographic risk patterns.
- Identify potential financial crime hotspots.
- Support location-based analysis.

### 7. Alert Management
- Monitor suspicious activity alerts.
- Prioritize potential risks.
- Track alert status.
- Support investigation workflows.

### 8. Investigation Management
- Organize investigation records.
- Track case progress.
- Maintain investigation notes.
- Reference supporting evidence.

### 9. Forensic Ledger
- Maintain hash-based evidence records.
- Support integrity verification.
- Record investigation-related activities.
- Provide tamper-evident record mechanisms.

### 10. AI Investigation Assistant
- Generate case summaries.
- Assist with transaction analysis.
- Provide contextual investigative insights.
- Support natural-language queries using Google Gemini when configured.

### 11. Synthetic Data Simulator
- Generate synthetic financial transaction scenarios.
- Simulate multi-hop transaction patterns.
- Support testing and demonstration.
- Evaluate analytical workflows under different scenarios.

## System Architecture

Cybertrace follows a modular full-stack architecture consisting of three primary technical layers.

**Frontend**
Provides the user interface, dashboards, transaction visualizations, graph analysis, maps and investigation tools.

**Backend**
Handles API requests, application logic, complaint management, transaction processing and communication between application modules.

**Machine Learning Engine**
Processes transaction-related features, trains predictive models, evaluates model performance and generates ATM candidate rankings.

**Simulator**
Generates synthetic financial crime scenarios for testing and development.

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React 19, TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS 4 |
| Backend | Node.js, Express.js |
| API | REST API |
| Machine Learning | Python, Scikit-learn, NumPy |
| Graph Visualization | React Flow |
| Geospatial Maps | Leaflet |
| Data Visualization | Recharts |
| AI Integration | Google Gemini API |
| Event Simulation | Python, TypeScript |
| Version Control | Git, GitHub |

## Machine Learning

The machine learning component focuses on ranking potential ATM withdrawal locations based on transaction-related, geographic and temporal features.

The existing ML pipeline includes:

- Dataset generation.
- Feature engineering.
- Model training.
- Candidate prediction and ranking.
- Model evaluation.
- Model artifact management.

The system includes Python scripts for training, inference and evaluation.

## Project Structure

```text
FinTrace/
│
├── src/                 # React frontend
│   ├── components/      # Reusable UI components
│   ├── context/         # Application contexts
│   ├── data/            # Application data
│   ├── pages/           # Application pages
│   ├── services/        # API integration
│   ├── types/           # TypeScript definitions
│   └── utils/           # Utility functions
│
├── ml/                  # Machine learning engine
│   ├── models/          # Trained model artifacts
│   ├── dataset.py       # Dataset generation
│   ├── features.py      # Feature engineering
│   ├── train_ranker.py  # Model training
│   ├── predict.py       # Prediction
│   └── evaluate.py      # Model evaluation
│
├── simulator/           # Synthetic event generation
│   ├── generator.ts
│   └── stream.py
│
├── server.ts            # Express backend
├── package.json         # Project dependencies
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── README.md
└── .env.example
```

## Installation and Setup

### Prerequisites

- Node.js 18 or later.
- npm 9 or later.
- Python 3.10 or later.
- Git.

### 1. Clone the repository

```bash
git clone https://github.com/sagar-1212/Fintrace.git
cd Fintrace
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file using the provided example:

```bash
cp .env.example .env
```

Configure the required environment variables. Google Gemini integration requires an API key if you want to use its online AI functionality.

### 4. Run the application

```bash
npm run dev
```

Open the local development URL displayed in your terminal.

### 5. Machine Learning Setup

Install the Python dependencies required by the ML scripts, then run:

```bash
python ml/train_ranker.py
```

Run model evaluation using:

```bash
python ml/evaluate.py
```

## Data and Privacy

CyberTrace supports synthetic financial transaction scenarios for development, testing and demonstration.

Synthetic records must not be interpreted as genuine bank transactions, real customer information or verified criminal investigations.

Predictive outputs are analytical estimates and should not be treated as definitive evidence or automatic decisions.

Sensitive financial information should be protected through appropriate security and access-control mechanisms.

## Future Scope

- Integration with persistent database storage.
- Improved transaction network analytics.
- Enhanced machine learning models.
- More advanced predictive analytics.
- Stronger authentication and role-based access control.
- Expanded investigation and reporting capabilities.
- Improved testing and deployment infrastructure.

## Project Status

CyberTrace is an evolving software project. Its modules and integrations are subject to ongoing development, testing and validation.

---

**CyberTrace — Turning Financial Transaction Data into Actionable Intelligence.**

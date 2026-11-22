# Deploying BulletProof to Render

BulletProof is fully configured for continuous zero-downtime deployment on [Render](https://render.com).

---

## Option 1: Automatic Blueprint Deployment (Recommended)

1. Log into your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** $\to$ **Blueprint**.
3. Select your GitHub repository: `Mayank-iitj/BulletProof`.
4. Render will automatically detect the [render.yaml](./render.yaml) file.
5. In the Environment Variables prompt, fill in your secret keys:
   - `FLAGSMITH_ENVIRONMENT_KEY`: Your Flagsmith Client/Environment Key (e.g. `erNxryCQZ9zHZ8E6YZwXhm`)
   - `NEXT_PUBLIC_FLAGSMITH_KEY`: Same Flagsmith Client Key
   - `FLAGSMITH_SERVER_KEY`: Your Flagsmith Server Key
   - `ANTHROPIC_API_KEY`: Your Anthropic API Key (`sk-ant-...`)
6. Click **Apply**. Render will automatically provision, build (`npm install && npm run build`), verify health at `/api/health`, and publish your service.

---

## Option 2: Manual Web Service Deployment

If creating as a standard Web Service instead of a Blueprint:

| Field | Configuration |
| :--- | :--- |
| **Type** | Web Service |
| **Name** | `bulletproof` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/api/health` |
| **Node Version** | Node 20.x or higher (configured in `package.json` engines) |

### Environment Variables to Configure in Render Dashboard:

| Key | Value / Source |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `NEXT_TELEMETRY_DISABLED` | `1` |
| `FLAGSMITH_ENVIRONMENT_KEY` | `erNxryCQZ9zHZ8E6YZwXhm` *(from Flagsmith)* |
| `NEXT_PUBLIC_FLAGSMITH_KEY` | `erNxryCQZ9zHZ8E6YZwXhm` |
| `FLAGSMITH_SERVER_KEY` | *(your Flagsmith server-side SDK key)* |
| `FLAGSMITH_API_URL` | `https://edge.api.flagsmith.com/api/v1/` |
| `ANTHROPIC_API_KEY` | *(your Anthropic Claude key)* |
| `MODEL_ID` | `claude-haiku-5-5` |
| `ADMIN_TOKEN` | *(any strong random string, e.g. `secret_bulletproof_admin_2026`)* |
| `DAILY_BUDGET_USD` | `15` |
| `STORE_PATH` | `.data/store.json` |

---

## Post-Deployment Verification

Once Render displays **Live**:
- **Main Landing Page:** `https://<your-render-subdomain>.onrender.com/`
- **Rewrite Workbench:** `https://<your-render-subdomain>.onrender.com/workbench`
- **PDF Resume Scanner:** `https://<your-render-subdomain>.onrender.com/workbench?tab=pdf`
- **Arena Experiment Leaderboard:** `https://<your-render-subdomain>.onrender.com/arena`
- **Health Check:** `https://<your-render-subdomain>.onrender.com/api/health`

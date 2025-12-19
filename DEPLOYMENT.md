# Deployment Guide

## 1. Backend Deployment (e.g., Render Web Service)

When deploying your backend, you must set the following **Environment Variables** in your hosting provider's dashboard. These are critical for the application to function and connect to the database securely.

You can find the values for these in your local `backend/.env` file.

| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `MONGODB_URI` | *[Your MongoDB Connection String]* | The connection string for your MongoDB Atlas cluster. |
| `DB_NAME` | `snapnote` | The name of the database. |
| `JWT_SECRET_KEY` | *[Your Secret Key]* | Secret key used for signing JWT tokens. |
| `ALGORITHM` | `HS256` | The algorithm used for JWT tokens. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Token expiration time in minutes. |

> **Important:** Never commit your `.env` file to GitHub. Always set these secrets directly in the deployment platform.

## 2. Frontend Deployment (e.g., Vercel, Netlify, Render Static Site)

When deploying your frontend, you need to tell it where to find the backend API.

| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | *[Your Deployed Backend URL]* | The URL of your live backend (e.g., `https://snapnote-backend.onrender.com`). |

> **Note:** Do **not** use `http://localhost:8000` for the `NEXT_PUBLIC_API_URL` in production. It must be the public URL of your deployed backend.

## 3. CORS Configuration

Cross-Origin Resource Sharing (CORS) is a security feature that restricts which websites can communicate with your backend.

*   **Current Setup:** The backend is currently configured to accept requests from:
    *   `http://localhost:3000` (Local Development)
    *   `http://localhost:5173` (Local Development)
    *   `https://snapnote-6jja.onrender.com` (Your Live Frontend)

*   **If your Frontend URL changes:**
    1.  Open `backend/main.py`.
    2.  Update the `origins` list with the new URL.
    3.  Commit and push the changes to GitHub.
    4.  Redeploy the backend.
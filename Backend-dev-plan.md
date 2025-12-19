# Backend Development Plan: SnapNote

## 1️⃣ Executive Summary
This document outlines the backend development plan for **SnapNote**, a fast note-taking application. The backend will be built using **FastAPI (Python 3.13)** and **MongoDB Atlas** (using Motor driver). The development process is divided into dynamic sprints to ensure all frontend features are fully supported.

**Key Constraints:**
- **Framework:** FastAPI (Python 3.13, Async)
- **Database:** MongoDB Atlas (Motor + Pydantic v2)
- **Deployment:** No Docker, local runner connecting to Atlas
- **Workflow:** Single branch (`main`), manual testing after every task
- **Validation:** All features verified via frontend UI

---

## 2️⃣ In-Scope & Success Criteria

**In-Scope Features:**
- **Authentication:** Signup, Login, Logout, Session persistence (Me).
- **Dashboard:** Quick Add Widget, Recent Notes, Tag Cloud.
- **Notes Management:** Create, Read (List/Detail), Update, Soft Delete (Archive), Restore, Permanent Delete.
- **Tag Management:** Create, List, Rename, Delete.
- **Search & Filter:** Text search notes, filter by tags.
- **Settings:** Update Profile (Name), Clear Archive.

**Success Criteria:**
- All frontend components verify data persistence with MongoDB Atlas.
- `APP_ENV=development` allows local execution without Docker.
- Manual verification steps pass for every task.
- Codebase is pushed to `main` after every sprint.

---

## 3️⃣ API Design

**Base Path:** `/api/v1`  
**Error Format:** `{ "error": "Description of error" }`

### **Auth**
- `POST /auth/signup` - Register new user.
- `POST /auth/login` - Authenticate and return JWT (httpOnly cookie).
- `POST /auth/logout` - Clear auth cookie.
- `GET /auth/me` - Get current user context.

### **Notes**
- `GET /notes` - List notes (supports `?search=`, `?tags=`, `?archived=true/false`).
- `POST /notes` - Create a new note.
- `GET /notes/{id}` - Get a specific note.
- `PUT /notes/{id}` - Update a note.
- `DELETE /notes/{id}` - Soft delete (archive) a note.
- `POST /notes/{id}/restore` - Restore a soft-deleted note.
- `DELETE /notes/{id}/permanent` - Hard delete a note.
- `DELETE /notes/archive/clear` - Hard delete all archived notes.

### **Tags**
- `GET /tags` - List all user tags.
- `POST /tags` - Create a new tag.
- `PUT /tags/{id}` - Rename a tag (updates usage across notes if needed, though frontend handles this via ID mostly).
- `DELETE /tags/{id}` - Delete a tag (cleanup references).

### **User**
- `PUT /users/profile` - Update display name.

---

## 4️⃣ Data Model (MongoDB Atlas)

### **users**
```json
{
  "_id": "ObjectId",
  "email": "string (unique)",
  "password_hash": "string",
  "name": "string",
  "created_at": "datetime"
}
```

### **notes**
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId (ref: users)",
  "title": "string",
  "content": "string",
  "tags": ["string (Tag IDs)"],
  "is_archived": "boolean (default: false)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### **tags**
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId (ref: users)",
  "name": "string",
  "created_at": "datetime"
}
```

---

## 5️⃣ Frontend Audit & Feature Map

| Page/Component | Feature | Backend Need | Model |
| :--- | :--- | :--- | :--- |
| **Auth Pages** | Signup/Login | `POST /auth/signup`, `POST /auth/login` | User |
| **Dashboard** | Recent Notes | `GET /notes?limit=6` | Note |
| **Dashboard** | Quick Add | `POST /notes` | Note |
| **Dashboard** | Tag Cloud | `GET /tags` | Tag |
| **NotesList** | List Notes | `GET /notes` | Note |
| **NotesList** | Search/Filter | `GET /notes?search=x&tags=y` | Note |
| **NoteEditor** | Create/Update | `POST /notes`, `PUT /notes/{id}` | Note |
| **NoteEditor** | Create Tag | `POST /tags` | Tag |
| **NoteEditor** | Delete Note | `DELETE /notes/{id}` | Note |
| **ArchivePage** | List Archived | `GET /notes?archived=true` | Note |
| **ArchivePage** | Restore/Delete | `POST /notes/{id}/restore`, `DELETE /notes/{id}/permanent` | Note |
| **SettingsPage** | Update Profile | `PUT /users/profile` | User |
| **SettingsPage** | Stats | Derived from `GET /notes` counts | Note |
| **SettingsPage** | Clear Archive | `DELETE /notes/archive/clear` | Note |

---

## 6️⃣ Configuration & ENV Vars

```properties
APP_ENV=development
PORT=8000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=change_this_secret_locally
JWT_EXPIRES_IN=604800  # 7 days
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## 7️⃣ Testing Strategy

**Manual Validation Only:**
- Automated tests are not required.
- Verification is done by running the backend and interacting with the Frontend UI.
- Every task includes a specific "Manual Test Step".

---

## 8️⃣ Dynamic Sprint Plan

### 🧱 S0 – Environment Setup & Frontend Connection

**Objectives:**
- Initialize FastAPI project.
- Connect to MongoDB Atlas.
- Configure CORS.
- Setup Git.

**Tasks:**
1. **Initialize Project**
   - Create `requirements.txt` (fastapi, uvicorn, motor, pydantic, pydantic-settings, pyjwt, passlib[argon2], python-multipart).
   - Create `backend/main.py` with `FastAPI` app.
   - **Manual Test Step:** Run `uvicorn backend.main:app --reload`. access `http://localhost:8000/docs`.
   - **User Test Prompt:** "Start the backend server and verify the Swagger UI loads."

2. **Database Connection**
   - Create `backend/database.py` with Motor client.
   - Create `/healthz` endpoint in `main.py` that pings DB.
   - **Manual Test Step:** Visit `http://localhost:8000/healthz`.
   - **User Test Prompt:** "Check healthz endpoint returns status ok and database connected."

3. **CORS & Git**
   - Configure `CORSMiddleware` in `main.py`.
   - Initialize git, add `.gitignore`, commit.
   - **Manual Test Step:** Check `OPTIONS` request allowed from frontend origin.
   - **User Test Prompt:** "Verify CORS settings allow requests from localhost:3000."

**Definition of Done:**
- Backend running.
- DB Connected.
- Git Initialized.

---

### 🧩 S1 – Authentication

**Objectives:**
- Secure the app with JWT Auth.

**Tasks:**
1. **User Model & Auth Utils**
   - Create `User` model.
   - Add password hashing (Argon2) and JWT generation utils.
   - **Manual Test Step:** None (code only).
   - **User Test Prompt:** "Review code for auth utilities."

2. **Signup & Login Endpoints**
   - Implement `POST /auth/signup` and `POST /auth/login`.
   - **Manual Test Step:** Use Frontend Signup page. Verify redirection to Dashboard.
   - **User Test Prompt:** "Register a new user via the UI. Then log out and log back in."

3. **Get Current User (Me)**
   - Implement `GET /auth/me` to persist session on reload.
   - **Manual Test Step:** Reload the page after login. Ensure user remains logged in.
   - **User Test Prompt:** "Refresh the browser. Verify the user session persists."

4. **Logout**
   - Implement `POST /auth/logout` (clear cookie).
   - **Manual Test Step:** Click "Sign Out" in Settings. Verify redirection to Login.
   - **User Test Prompt:** "Click Sign Out. Verify you are redirected to the auth page."

**Definition of Done:**
- User can sign up, log in, persist session, and log out via UI.

---

### 📝 S2 – Core Notes Management

**Objectives:**
- Full CRUD for Notes.
- Dashboard integration.

**Tasks:**
1. **Note Model & Create Endpoint**
   - Create `Note` model.
   - Implement `POST /notes`.
   - **Manual Test Step:** Use "Quick Add" on Dashboard. Verify note appears.
   - **User Test Prompt:** "Type a note in the Quick Add widget and save. Verify it saves successfully."

2. **List Notes Endpoint**
   - Implement `GET /notes` with `limit` param.
   - **Manual Test Step:** Check "Recent Notes" on Dashboard.
   - **User Test Prompt:** "Verify the dashboard displays the recently created notes."

3. **Get & Update Note**
   - Implement `GET /notes/{id}` and `PUT /notes/{id}`.
   - **Manual Test Step:** Click a note to open Editor. Edit content. Wait for auto-save.
   - **User Test Prompt:** "Open a note, edit the text, and wait. Verify changes persist after reload."

4. **Soft Delete (Archive)**
   - Implement `DELETE /notes/{id}` (set `is_archived=true`).
   - **Manual Test Step:** Click Trash icon in Editor. Verify note disappears from Dashboard.
   - **User Test Prompt:** "Delete a note. Confirm it is removed from the active list."

**Definition of Done:**
- Users can create, view, edit, and archive notes.

---

### 🏷️ S3 – Tags & Search

**Objectives:**
- Tag management and filtering.
- Text search.

**Tasks:**
1. **Tag Management**
   - Create `Tag` model.
   - Implement `GET /tags`, `POST /tags`, `DELETE /tags/{id}`.
   - **Manual Test Step:** In Note Editor, add a new tag. Verify it appears in Dashboard Tag Cloud.
   - **User Test Prompt:** "Add a tag to a note. Check if the tag appears in the dashboard list."

2. **Search & Filter Implementation**
   - Update `GET /notes` to support `?search=` and `?tags=`.
   - **Manual Test Step:** Use Search bar in Notes List. Use Tag filter sidebar.
   - **User Test Prompt:** "Search for a specific word in a note. Filter by a tag. Verify results."

**Definition of Done:**
- Tags function end-to-end.
- Search and Filtering works on Notes List.

---

### 🗄️ S4 – Archive & Settings

**Objectives:**
- Manage archived notes.
- User profile settings.

**Tasks:**
1. **Archive Management**
   - Update `GET /notes` to support `?archived=true`.
   - Implement `POST /notes/{id}/restore`.
   - Implement `DELETE /notes/{id}/permanent`.
   - **Manual Test Step:** Go to Archive page. Restore one note. Permanently delete another.
   - **User Test Prompt:** "Restore a note from archive. Permanently delete another note. Verify lists update."

2. **Settings Features**
   - Implement `PUT /users/profile` (update name).
   - Implement `DELETE /notes/archive/clear`.
   - **Manual Test Step:** Change display name in Settings. Clear all archived notes.
   - **User Test Prompt:** "Update your display name. Then clear the archive. Verify changes."

**Definition of Done:**
- Archive features fully functional.
- Settings page fully functional.
- Project complete.
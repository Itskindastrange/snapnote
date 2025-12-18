# PRODUCT REQUIREMENTS DOCUMENT

## EXECUTIVE SUMMARY

**Product Name:** SnapNote

**Product Vision:** SnapNote is a fast, intelligent note-taking application that eliminates friction in capturing and retrieving thoughts. Users can quickly jot down ideas without worrying about titles or organization, while powerful search and tagging help them find anything instantly.

**Core Purpose:** Solves the problem of losing thoughts due to slow, complex note-taking tools. Students, developers, and busy professionals need to capture ideas the moment they occur and retrieve them effortlessly when needed.

**Target Users:** Students managing coursework and research, developers documenting code snippets and technical notes, and busy professionals capturing meeting notes and action items.

**Key MVP Features:**
- User Authentication - System/Configuration
- Create and Edit Notes - User-Generated Content
- Notes List View - User-Generated Content
- Basic Text Search - System Data
- Manual Tags - User-Generated Content
- Filter by Tags - System Data
- Auto-Generated Titles - System Data

**Platform:** Web application (responsive design, accessible via browser on desktop, tablet, and mobile devices)

**Complexity Assessment:** Simple
- State Management: Backend with localStorage cache
- External Integrations: None required for MVP
- Business Logic: Simple CRUD operations with text search and filtering

**MVP Success Criteria:**
- Users create average 20+ notes in first week
- 80% of users use search at least once per session
- Users add tags to 60% of their notes
- 70% of users return within 3 days
- Average session includes creating 2+ notes
- All CRUD operations work without errors
- Responsive design functions on mobile/tablet/desktop
- Search returns relevant results within 1 second

---

## 1. USERS & PERSONAS

**Primary Persona:**
- **Name:** Alex the Developer
- **Context:** Full-stack developer working on multiple projects simultaneously, needs to capture code snippets, bug notes, API documentation references, and technical decisions quickly during coding sessions
- **Goals:** Capture technical notes without breaking flow, find specific code snippets or solutions from past notes instantly, organize notes by project or technology using tags
- **Pain Points:** Current tools (Notion, Evernote) are too slow to load and require too many clicks to create a note, loses context switching between IDE and note app, can't find old notes when needed most

**Secondary Persona:**
- **Name:** Sarah the Student
- **Context:** College student juggling multiple courses, research projects, and study groups, takes notes during lectures and while reading
- **Goals:** Quickly capture lecture notes and reading highlights, organize notes by course and topic, find specific concepts when studying for exams
- **Pain Points:** Misses important points while trying to organize notes during lectures, can't remember which notebook contains specific information, wastes time searching through disorganized notes

---

## 2. FUNCTIONAL REQUIREMENTS

### 2.1 Core MVP Features (Priority 0)

**FR-001: User Authentication**
- **Description:** Secure user registration, login, session management, and profile management
- **Entity Type:** System/Configuration
- **Operations:** Register, Login, View profile, Edit profile (name/email), Change password, Logout
- **Key Rules:** Passwords hashed with bcrypt, JWT tokens expire after 7 days, email must be unique
- **Acceptance:** Users can register with email/password, login to access their notes, stay logged in across sessions, and manage their account settings

**FR-002: Create and Edit Notes**
- **Description:** Fast note creation with Markdown support, auto-save, and auto-generated titles
- **Entity Type:** User-Generated Content
- **Operations:** Create, View, Edit, Delete (soft), List, Search, Archive, Export
- **Key Rules:** Auto-save every 3 seconds while editing, if title empty use first 50 chars of content, Markdown rendered in view mode
- **Acceptance:** Users can create notes instantly, write with Markdown formatting, see auto-save indicator, edit existing notes, and have titles generated automatically

**FR-003: Notes List View**
- **Description:** Display all user notes sorted by most recent, with preview and metadata
- **Entity Type:** User-Generated Content
- **Operations:** View list, Sort (by date/title), Filter (by tags), Search, Bulk actions (archive/delete)
- **Key Rules:** Show 20 notes per page with infinite scroll, display first 150 chars as preview, show tags and last modified date
- **Acceptance:** Users see all their notes sorted by recency, can preview content without opening, and navigate to full note with one click

**FR-004: Basic Text Search**
- **Description:** Real-time search across note titles and content with keyword matching
- **Entity Type:** System Data
- **Operations:** Search (by keyword), View results, Clear search, Search history (last 5 searches)
- **Key Rules:** Search both title and content fields, case-insensitive, return results sorted by relevance (title matches first)
- **Acceptance:** Users type search query and see matching notes instantly, with search terms highlighted in results

**FR-005: Manual Tags**
- **Description:** User-created tags for organizing notes with tag management
- **Entity Type:** User-Generated Content
- **Operations:** Create tag, Add to note, Remove from note, View all tags, Rename tag (global), Delete tag (global)
- **Key Rules:** Tags are lowercase, alphanumeric with hyphens, max 20 chars, max 10 tags per note, tag rename updates all notes
- **Acceptance:** Users can add tags while editing notes, create new tags on-the-fly, manage master tag list, and rename/delete tags globally

**FR-006: Filter by Tags**
- **Description:** Filter notes list by one or multiple selected tags
- **Entity Type:** System Data
- **Operations:** Select tag(s), View filtered results, Clear filters, Combine with search
- **Key Rules:** Multiple tag selection uses AND logic (note must have all selected tags), filter persists during session
- **Acceptance:** Users click tags to filter notes, see only notes with selected tags, combine tag filters with text search

**FR-007: Quick Add Widget**
- **Description:** Dashboard widget for instant note creation without navigation
- **Entity Type:** User-Generated Content
- **Operations:** Create note from widget, Auto-save, Navigate to full editor (optional)
- **Key Rules:** Widget always visible on dashboard, saves note on blur or explicit save, supports Markdown input
- **Acceptance:** Users type note directly on dashboard, note saves automatically, can expand to full editor if needed

---

## 3. USER WORKFLOWS

### 3.1 Primary Workflow: Capture and Retrieve a Note

**Trigger:** User has a thought or information they need to save
**Outcome:** Note is captured, organized, and retrievable via search or tags

**Steps:**
1. User opens SnapNote dashboard and sees Quick Add widget
2. User types note content in widget with optional Markdown formatting
3. System auto-saves note after 3 seconds, generates title from first line if empty
4. User adds 1-3 relevant tags by typing in tag field (creates new tags or selects existing)
5. System saves tags and displays note in recent notes list
6. Later, user searches for keyword or filters by tag
7. System displays matching notes with search terms highlighted
8. User clicks note to view full content with rendered Markdown

### 3.2 Key Supporting Workflows

**Create Note:** User clicks "New Note" or uses Quick Add widget → types content with Markdown → adds tags → system auto-saves → note appears in list

**Edit Note:** User clicks note from list → opens in editor → modifies content/tags → system auto-saves → sees "Saved" indicator → returns to list

**Delete Note:** User opens note → clicks delete icon → confirms deletion → note soft-deleted (archived) → removed from main list

**Search Notes:** User types in search bar → system filters notes in real-time → user sees matching results with highlights → clicks result to open

**Filter by Tags:** User clicks tag from tag cloud or note preview → list filters to show only notes with that tag → user clicks additional tags for AND filtering → clicks "Clear" to reset

**Manage Tags:** User opens tag management view → sees all tags with usage count → renames tag (updates all notes) → deletes unused tag → changes reflected across all notes

---

## 4. BUSINESS RULES

### 4.1 Entity Lifecycle Rules

| Entity | Type | Who Creates | Who Edits | Who Deletes | Delete Action |
|--------|------|-------------|-----------|-------------|---------------|
| User | System/Config | Self (register) | Self | Self | Hard delete + cascade notes |
| Note | User-Generated | Owner | Owner | Owner | Soft delete (archive 30 days) |
| Tag | User-Generated | Owner | Owner (rename) | Owner | Hard delete (removes from notes) |
| Search History | System Data | System | None | System (auto) | Auto-delete after 30 days |

### 4.2 Data Validation Rules

| Entity | Required Fields | Key Constraints |
|--------|-----------------|-----------------|
| User | email, password | Email unique, password min 8 chars with number |
| Note | content, ownerId | Content min 1 char, title max 200 chars, content max 50,000 chars |
| Tag | name, ownerId | Name lowercase alphanumeric+hyphens, max 20 chars, unique per user |

### 4.3 Access & Process Rules
- Users can only view, edit, and delete their own notes and tags
- Auto-save triggers every 3 seconds during active editing (debounced)
- Auto-generated titles use first 50 characters of content, truncated at word boundary
- Tag rename updates all notes containing that tag atomically
- Soft-deleted notes archived for 30 days before permanent deletion
- Search indexes both title and content fields with case-insensitive matching
- Maximum 10 tags per note to maintain UI clarity
- Free tier users limited to 1,000 notes (sufficient for MVP validation)

---

## 5. DATA REQUIREMENTS

### 5.1 Core Entities

**User**
- **Type:** System/Configuration | **Storage:** Backend (MongoDB)
- **Key Fields:** id, email, passwordHash, name, createdAt, updatedAt, preferences (theme, defaultView)
- **Relationships:** has many Notes, has many Tags
- **Lifecycle:** Full CRUD with password change, account export (JSON), and account deletion (cascades to notes/tags)

**Note**
- **Type:** User-Generated Content | **Storage:** Backend (MongoDB) with localStorage cache
- **Key Fields:** id, title, content, ownerId, tags (array), isArchived, createdAt, updatedAt, lastViewedAt
- **Relationships:** belongs to User, has many Tags (via array reference)
- **Lifecycle:** Full CRUD with soft delete (archive), restore from archive, export (Markdown), and permanent delete after 30 days

**Tag**
- **Type:** User-Generated Content | **Storage:** Backend (MongoDB)
- **Key Fields:** id, name, ownerId, usageCount, createdAt, updatedAt
- **Relationships:** belongs to User, referenced by many Notes
- **Lifecycle:** Create, View, Rename (updates all notes), Delete (removes from all notes), usage count auto-updated

**SearchHistory**
- **Type:** System Data | **Storage:** Backend (MongoDB)
- **Key Fields:** id, userId, query, resultCount, timestamp
- **Relationships:** belongs to User
- **Lifecycle:** Create (auto), View (last 5), Auto-delete after 30 days

### 5.2 Data Storage Strategy
- **Primary Storage:** MongoDB backend database for persistence
- **Cache Layer:** localStorage for offline access to recently viewed notes (last 20)
- **Capacity:** MongoDB supports unlimited notes per user (free tier capped at 1,000)
- **Persistence:** All data persists across sessions and devices
- **Audit Fields:** All entities include createdAt, updatedAt, createdBy (userId)
- **Indexing:** Text index on Note.title and Note.content for search, compound index on Note.ownerId + Note.updatedAt for list queries

---

## 6. INTEGRATION REQUIREMENTS

No external integrations required for MVP. All functionality implemented with internal backend services.

---

## 7. VIEWS & NAVIGATION

### 7.1 Primary Views

**Dashboard** (`/`) - Quick Add widget at top, recent notes grid (6 most recent), tag cloud, search bar, "View All Notes" button

**Notes List** (`/notes`) - All notes in card grid, search bar, tag filter sidebar, sort dropdown (recent/title/oldest), infinite scroll, bulk actions toolbar

**Note Editor** (`/notes/:id` or `/notes/new`) - Full-screen editor with Markdown toolbar, title field (optional), content area, tag input, auto-save indicator, back button, delete button

**Note View** (`/notes/:id/view`) - Rendered Markdown content, metadata (tags, dates), edit button, delete button, share button (future)

**Tag Management** (`/tags`) - List of all tags with usage counts, rename/delete actions, merge tags feature (future)

**Settings** (`/settings`) - Profile (name, email), change password, theme toggle (light/dark), export all notes (JSON/Markdown), delete account

**Archive** (`/archive`) - Soft-deleted notes with restore/permanent delete options, auto-delete countdown display

### 7.2 Navigation Structure

**Main Nav:** Dashboard | All Notes | Tags | Settings | User Menu (profile, logout)
**Default Landing:** Dashboard (logged in) or Login page (logged out)
**Mobile:** Bottom navigation bar with icons, hamburger menu for secondary actions
**Keyboard Shortcuts:** Ctrl+N (new note), Ctrl+K (search), Ctrl+S (save - though auto-save handles this)

---

## 8. MVP SCOPE & CONSTRAINTS

### 8.1 MVP Success Definition

The MVP is successful when:
- ✅ Users complete full note lifecycle: create → tag → search → edit → delete
- ✅ All features from Section 2.1 fully functional without errors
- ✅ Auto-save works reliably with visual feedback
- ✅ Search returns relevant results within 1 second
- ✅ Responsive design works on mobile, tablet, and desktop
- ✅ Data persists across sessions and devices
- ✅ Users achieve success metrics: 20+ notes/week, 80% use search, 60% use tags, 70% return within 3 days

### 8.2 In Scope for MVP

Core features included:
- FR-001: User Authentication (register, login, profile management)
- FR-002: Create and Edit Notes (with Markdown, auto-save, auto-titles)
- FR-003: Notes List View (sorted, paginated, with previews)
- FR-004: Basic Text Search (real-time, keyword matching)
- FR-005: Manual Tags (create, add, remove, rename, delete)
- FR-006: Filter by Tags (single and multiple tag filtering)
- FR-007: Quick Add Widget (dashboard instant note creation)

Additional MVP capabilities:
- Soft delete with 30-day archive
- Export notes as JSON or Markdown
- Dark/light theme toggle
- Keyboard shortcuts for power users
- Mobile-responsive design
- Offline access to recently viewed notes (localStorage cache)

### 8.3 Technical Constraints

- **Data Storage:** MongoDB backend with localStorage cache (last 20 notes for offline)
- **Concurrent Users:** Expected 100-500 users during MVP validation phase
- **Performance:** Page loads <2s, search results <1s, auto-save <500ms
- **Browser Support:** Chrome, Firefox, Safari, Edge (last 2 versions)
- **Mobile:** Responsive design, iOS Safari and Android Chrome support
- **Offline:** Read-only access to cached notes, sync on reconnection
- **Note Limits:** Free tier capped at 1,000 notes per user
- **Content Limits:** 50,000 characters per note, 200 characters per title

### 8.4 Known Limitations

**For MVP:**
- No real-time collaboration or note sharing between users
- No AI-powered features (semantic search, auto-tagging, smart suggestions)
- No file attachments or image uploads within notes
- No note versioning or edit history
- No mobile native apps (web-only, responsive design)
- No advanced Markdown features (tables, diagrams, embeds)
- No integration with external tools (Slack, email, calendar)
- Search limited to exact keyword matching (no fuzzy search or synonyms)

**Future Enhancements:**
- V2 will add AI semantic search using embeddings for "find notes about X" queries
- V2 will implement auto-tagging based on note content analysis
- V2 will add note sharing and collaboration features
- V2 will support file attachments and image uploads
- V2 will include version history and change tracking
- V3 will add native mobile apps for iOS and Android
- V3 will integrate with popular productivity tools

---

## 9. ASSUMPTIONS & DECISIONS

### 9.1 Platform Decisions
- **Type:** Full-stack web application (React frontend + Node.js/Express backend)
- **Storage:** MongoDB for primary data, localStorage for offline cache
- **Auth:** JWT-based authentication with httpOnly cookies for security
- **Deployment:** Cloud-hosted (AWS/Vercel) for scalability and reliability

### 9.2 Entity Lifecycle Decisions

**Note:** Full CRUD + soft delete (archive) + export
- **Reason:** User-generated content requires complete control; soft delete prevents accidental data loss; export enables data portability

**Tag:** Create + View + Rename (global) + Delete (global)
- **Reason:** Tags are organizational metadata; global rename maintains consistency across all notes; delete removes from all notes to prevent orphaned references

**User:** Full CRUD + export + cascade delete
- **Reason:** Users own their data and must be able to manage accounts; cascade delete ensures GDPR compliance; export enables data portability

**SearchHistory:** Create (auto) + View + Auto-delete
- **Reason:** System-generated data for UX improvement; auto-delete after 30 days for privacy; no user editing needed

### 9.3 Key Assumptions

1. **Users prefer speed over advanced formatting**
   - Reasoning: Product idea emphasizes "capture thoughts quickly" and targets busy professionals who need minimal friction; Markdown provides sufficient formatting without complex WYSIWYG overhead

2. **Manual tagging validates organization workflow before AI investment**
   - Reasoning: MVP validation hypothesis explicitly states testing manual tags before building AI auto-tagging; this reduces technical complexity and validates user behavior patterns

3. **Text search sufficient for MVP, semantic search for V2**
   - Reasoning: Basic keyword search meets 80% use case for finding notes; AI semantic search requires embeddings infrastructure (OpenAI API, vector database) which adds complexity better suited for post-validation

4. **Web-first approach with responsive design covers mobile needs**
   - Reasoning: Native mobile apps require separate codebases and app store distribution; responsive web app accessible on all devices via browser reduces development time and enables faster iteration

5. **1,000 note limit sufficient for MVP validation**
   - Reasoning: Success metrics target 20+ notes in first week; even power users unlikely to exceed 1,000 notes during 3-month validation period; limit can be raised post-validation

### 9.4 Clarification Q&A Summary

**Q:** Would you prefer to support Markdown syntax for better structure while keeping speed?
**A:** Yes
**Decision:** Implemented Markdown editor with live preview toggle; provides formatting flexibility (bold, lists, headers, code blocks) without sacrificing input speed; rendered in view mode for clean reading experience

**Q:** Should users manage a master tag list (rename/delete globally) or free-form tags created within notes?
**A:** Decide yourself
**Decision:** Hybrid approach - tags created free-form within note editor (low friction) but managed via master tag list (rename/delete globally); this balances quick capture with organizational control; tag rename updates all notes atomically to maintain consistency

**Q:** What visual vibe do you envision for SnapNote?
**A:** Something cool
**Decision:** Modern, minimal interface with dark/light theme toggle; clean typography, ample whitespace, subtle animations for feedback; "cool" interpreted as contemporary design that feels fast and uncluttered rather than feature-heavy

**Q:** Would you like a Quick Add widget on dashboard or keyboard shortcuts?
**A:** Maybe a dashboard widget
**Decision:** Implemented Quick Add widget prominently on dashboard for instant note creation without navigation; also added keyboard shortcuts (Ctrl+N, Ctrl+K) for power users; widget supports Markdown and auto-save for seamless capture experience

---

**PRD Complete - Ready for Development**
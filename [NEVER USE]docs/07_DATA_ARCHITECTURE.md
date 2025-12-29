# 07. Data & Database Architecture

## 7.1 Conceptual Data Model

The data model centers around the **User** (Senior) and their **Legacy** (Chapters).

-   **User:** The root entity.
-   **Session:** A raw interaction event (Voice/Chat). Ephemeral in nature but stored for auditing.
-   **Chapter:** The crystallized, valuable output derived from Sessions. Permanent.
-   **Storybook:** A collection of Chapters formatted for print/export.
-   **Invitation:** A mechanism to link Family (Users) to Seniors.

---

## 7.2 Logical Schema (PostgreSQL)

### **Users Table**
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | PK |
| `role` | Varchar | 'senior' or 'family' |
| `senior_id` | UUID | Self-ref FK. If family, points to the senior they manage. |
| `preferences` | JSONB | Stores flexible profile data (schedule, topics). |

### **Chapters Table**
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | PK |
| `session_id` | UUID | FK to Session source. |
| `content` | Text | Markdown formatted story. |
| `entities` | JSONB | Array of { type, name } for search. **GIN Indexed.** |
| `metadata` | JSONB | Stats (word count, tone). |

### **Sessions Table**
| Column | Type | Description |
| :--- | :--- | :--- |
| `transcript_raw` | Text | Full raw text. |
| `audio_url` | Varchar | Path to blob storage (S3/GCS). |

---

## 7.3 Indexing Strategy

1.  **Primary Keys:** UUID v4 for all tables to prevent enumeration attacks and allow easy migration.
2.  **Foreign Keys:** Indexed by default in Drizzle/Postgres for join performance.
3.  **JSONB Indexing:** `chapters.entities` has a **GIN Index**.
    -   *Query:* "Find all chapters mentioning 'Chicago'."
    -   *Performance:* O(1) lookup instead of table scan.

---

## 7.4 Data Lifecycle

1.  **Creation:** Created in `pending` state (Session).
2.  **Processing:** Job converts Session -> Chapter.
3.  **Active:** Chapter is visible on Dashboard.
4.  **Archival:** (Future) Cold storage after 5 years of inactivity.
5.  **Deletion:** GDPR "Right to be Forgotten". Cascading delete from `User` -> `Chapters`.

---

## 7.5 Data Consistency

-   **Transactions:** Chapter generation is wrapped in a transaction. If AoT fails, no partial chapter is saved.
-   **Optimistic Concurrency:** Not currently strictly enforced (MVP), but schema supports `updatedAt` for future versioning.

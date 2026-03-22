# 📘 MO Module (Position + Module + Work Hours Management)

## 📌 Project Overview

This module is part of the **MO-side system (Position + Module + Work Hours Management)**. It serves administrators (Admin) and student users to handle job posting, approval workflows, work hour management, and performance evaluation.

This README documents the features, design ideas, and implementation details I was responsible for.

---

## 🧩 Module Overview

I was responsible for the following 9 core modules:

1. Job Posting
2. Job Status Management
3. Approval Workflow Visualization
4. Reminder System
5. My Modules
6. Module Change Request
7. Work Hour Approval
8. Performance Evaluation
9. Work Hour Statistics

---

## 🚀 Feature Details

### 1️⃣ Job Posting

**Description:**
Allows admins to create and manage job postings.

**Key Features:**

* Job creation form:

  * Module
  * Role
  * Headcount
  * Work hours
  * Deadline
  * Description
  * Requirements
* Save as draft
* Submit for approval
* Edit drafts

**Design Highlights:**

* Form validation (required fields, format checks)
* Draft vs submitted state separation
* Workflow triggered after submission

---

### 2️⃣ Job Status Management

**Description:**
Tracks job postings across different lifecycle stages.

**Key Features:**

* Four status tabs:

  * Draft
  * Pending
  * Published
  * Completed
* Status badges
* Applicant count display
* Deadline countdown

**Design Highlights:**

* State-driven UI rendering
* Real-time countdown updates

---

### 3️⃣ Approval Workflow Visualization

**Description:**
Displays the full lifecycle of job approval.

**Key Features:**

* 5-step workflow visualization
* Current step highlighting
* Pending status indicators

**Design Highlights:**

* Reusable workflow component
* Binding between state and steps

---

### 4️⃣ Reminder System

**Description:**
Allows users to remind approvers to take action.

**Key Features:**

* Admin reminder button
* 30-second cooldown timer
* Reminder count tracking
* Toast notifications

**Design Highlights:**

* Throttling to prevent abuse
* Frontend-backend time synchronization

---

### 5️⃣ My Modules

**Description:**
Displays modules the user is involved in.

**Key Features:**

* Module cards:

  * Code
  * Title
  * Status
  * Semester
* TA quota progress bar
* Budgeted work hour progress
* Warning when ≥80% usage
* Completed vs remaining statistics

**Design Highlights:**

* Component-based card design
* Dynamic progress calculation

---

### 6️⃣ Module Change Request

**Description:**
Handles requests to modify existing modules.

**Key Features:**

* Create/edit request forms
* Save draft
* Submit for approval
* Status tracking:

  * Draft
  * Pending
  * Approved
  * Rejected
* Admin comments display

**Design Highlights:**

* Reuse of approval workflow
* Clear state transitions

---

### 7️⃣ Work Hour Approval

**Description:**
Admins review and approve student-submitted work hours.

**Key Features:**

* Work hour cards:

  * Student
  * Module
  * Week
  * Hours
  * Task list
* Expand/collapse details
* Approve / Reject actions

**Design Highlights:**

* List performance optimization (pagination / virtualization)
* Instant feedback on actions

---

### 8️⃣ Performance Evaluation

**Description:**
Allows admins to evaluate student performance.

**Key Features:**

* 1–5 star rating
* Quick comment selection
* Custom comment input

**Design Highlights:**

* Reusable rating component
* Form-data binding

---

### 9️⃣ Work Hour Statistics

**Description:**
Aggregates and analyzes work hour data.

**Key Features:**

* Pending approvals count
* Pending hours total
* Approved hours (weekly)
* Active TA count

**Design Highlights:**

* Data aggregation logic
* Extendable for charts/visualization

---

## 🏗️ Technical Implementation

* Frontend Framework: Vue / React (depending on project)
* State Management: Vuex / Redux
* UI Library: Element UI / Ant Design
* API Communication: Axios

**General Principles:**

* Component-based architecture
* State-driven UI
* High reusability
* Clear data flow

---

## 🔄 State & Workflow Design

* Job lifecycle:

  ```
  Draft → Pending → Published → Completed
  ```

* Module request lifecycle:

  ```
  Draft → Pending → Approved / Rejected
  ```

---

## 📈 Future Improvements

* Data visualization (e.g., ECharts)
* Fine-grained permission system (RBAC)
* Notification center
* Mobile adaptation

---

## 👤 Author

Responsible for the design and implementation of all core MO-side modules.

---

## 📎 Notes

This module forms the core business loop of the system, covering job management, module operations, and work hour processing.

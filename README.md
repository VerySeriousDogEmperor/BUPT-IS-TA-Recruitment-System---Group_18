<<<<<<< HEAD
*Authored by Guang Yang *

## Overview

This document describes the **Candidate Management module (MO End)** of the BUPT IS TA Recruitment System. It is designed to streamline the TA recruitment workflow for Module Owners (MOs), enabling efficient candidate screening, tracking, and evaluation.

## Core Modules & Features

### 1. Kanban Board

The Kanban board visualizes the entire candidate lifecycle across **6 sequential stages**:

* `New`: Newly submitted applications
* `Reviewing`: Under initial review by MOs
* `Shortlisted`: Qualified candidates selected for interview
* `Interviewing`: Currently in the interview process
* `Offered`: TA offer extended
* `Rejected`: Application declined

Each candidate is represented as a card displaying:

* Full name
* AI matching score
* GPA
* Target module
* Real-time stage counter (total candidates per stage)

## 2. Candidate Card

At a glance, the candidate card provides critical status indicators and quick actions:

* **Conflict Marker**: Highlights scheduling or eligibility conflicts
* **Skill Match Marker**: Visual indicator of alignment with module requirements
* **Quick Action Buttons**: One-click operations to advance/reject a candidate

### 3. Candidate Detail Drawer

A comprehensive side panel that opens when selecting a candidate card, containing:

* **Education Background**: Academic history, degrees, and institutions
* **Work Experience**: Relevant professional or TA experience
* **Awards & Achievements**: Honors, certifications, and extracurriculars
* **AI Matching Score**: Quantitative assessment of candidate-module fit
* **Skill Rating Bar**: Visual breakdown of technical/soft skill proficiency
* **AI-Generated Interview Questions**: Curated questions tailored to the candidate’s profile
* **Stage Action Buttons**: Formal controls to move the candidate between workflow stages

### 4. Kanban Filtering

Powerful filtering tools to refine the candidate list:

* **AI Match >80%**: Show only high-potential candidates with strong module alignment
* **No Conflict Filter**: Exclude candidates with scheduling/eligibility conflicts
* **Module Filter**: Narrow results to a specific target module
* **Clear Filters**: Reset all active filters
* **Count Display**: Real-time statistics showing the number of candidates matching current filters

### 5. Statistics Card

A high-level dashboard summarizing key recruitment metrics:

* Total applicants: Overall number of submissions
* High-matching applicants: Candidates with AI match score >80%
* Conflicting applicants: Candidates with scheduling/eligibility conflicts
* Pending Admin review: Candidates awaiting final approval from system administrators

### 6. Applicant Table

A tabular view for detailed data analysis and bulk operations:

* **Full List View**: Tabular display of all applicants
* **Sorting**: Order by AI score, GPA, or submission date
* **Filtering**: Refine by workflow stage, target module, or match level
* **Search**: Locate candidates by name or student ID
* **Detail Link**: Click any row to open the candidate’s full detail drawer

## Usage Flow

1. **Monitor**: MOs start by reviewing the Kanban board to track candidate progress across stages.
2. **Filter**: Use the Kanban filters to focus on high-priority candidates (e.g., AI match >80%).
3. **Evaluate**: Open the detail drawer to review a candidate’s full profile and AI-generated interview questions.
4. **Act**: Use quick buttons on the card or formal controls in the detail drawer to advance or reject candidates.
5. **Analyze**: Cross-reference with the statistics card and applicant table to assess overall recruitment health.

## Technical Notes

* All data is synced in real-time with the backend, ensuring all MOs see the latest candidate status.
* AI matching scores and interview questions are generated via the system’s integrated NLP model, based on candidate resumes and module requirements.
* Conflict detection is automated, flagging overlaps in class schedules or eligibility criteria.
=======
该分支为测试分支，测试完成后再推送至main
>>>>>>> 984061e821cf3e7e27a315a63d97bb94158351e7

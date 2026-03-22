# International School TA Recruitment System

A lightweight Java-based recruitment system for managing **Teaching Assistant (TA)** applications at **BUPT International School**.

This project was developed for the **EBU6304 Software Engineering Group Project**. It aims to streamline the TA recruitment workflow by replacing manual forms and spreadsheets with a simple software solution for applicants, Module Organisers (MO), and administrators. The coursework requires the system to be built as a Java application or a lightweight Java Servlet/JSP web application, with all data stored in text-based formats rather than a database. :contentReference[oaicite:0]{index=0}

---

## Features

### Applicant / TA
- Create and manage applicant profile
- Upload CV
- Browse available jobs
- Apply for positions
- Track application status

### Module Organiser (MO)
- Publish job positions
- Manage recruitment requests
- Review applicants for module-related roles

### Admin
- View recruitment overview dashboard
- Monitor TA workload and budget usage
- Review and approve/reject position requests
- Filter requests by department or MO
- Search by module name or code
- Access approval history
- View charts and analytics

---

## Admin Module Highlights

This repository includes an **Admin-side module** focused on **data overview and approval management**.

### Dashboard
- KPI cards for active positions, fill rate, workload, budget usage, and TA count
- Progress summary for recruitment status

### Analytics
- Recruitment trend charts
- Department workload comparison
- Fill-rate comparison
- Overall TA workload distribution

### Approval Management
- Review pending岗位 requests
- Approve or reject individual requests
- Batch approval / batch rejection
- Budget status badges:
  - `Within`
  - `Warning`
  - `Exceeded`

### Filter & Search
- Filter by department
- Filter by MO
- Search by module name / code
- Clear filters
- Display filtered result count

### History
- View processed approval records for traceability

---

## Tech Stack

- **Java**
- **Java Swing / JavaFX** or **Servlet / JSP**
- **JSON / CSV / TXT / XML** for file-based storage
- **JUnit** for testing
- **GitHub** for collaboration and version control

> Note: The coursework explicitly requires text-file storage and does **not** allow database integration. :contentReference[oaicite:1]{index=1}

---

## Project Structure

```text
TA-Recruitment-System/
├── src/
│   ├── model/
│   ├── service/
│   ├── controller/
│   ├── view/
│   └── util/
├── data/
│   ├── users.json
│   ├── jobs.json
│   ├── applications.json
│   ├── approval_requests.json
│   ├── approval_history.json
│   └── workload_summary.csv
├── test/
│   └── AdminModuleTest.java
├── docs/
│   ├── user_manual.pdf
│   ├── javadocs/
│   └── screenshots/
├── README.md
└── run.bat / run.sh
````

---

## Getting Started

### Requirements

* JDK 8 or above
* Java IDE such as IntelliJ IDEA or Eclipse

### Run as a Stand-alone Java Application

1. Clone this repository
2. Open the project in your IDE
3. Make sure the `data/` folder exists and contains the required files
4. Run the main entry point

```bash
java Main
```

### Run as a Servlet/JSP Web Application

1. Install JDK
2. Install Apache Tomcat
3. Import the project into your IDE
4. Deploy the project to Tomcat
5. Start the server and open the local URL in your browser

---

## Demo Account

Use a predefined admin account from the user data file.

```text
Username: admin
Password: admin123
```

Replace these credentials with the actual ones used in project.

---

## Data Storage

All system data is stored in simple text-based files, for example:

* `users.json`
* `jobs.json`
* `applications.json`
* `approval_requests.json`
* `approval_history.json`
* `workload_summary.csv`

This keeps the system lightweight and compliant with the project requirement that all input/output data must be stored in plain text formats rather than a database. 

---

## Example Admin Workflow

1. Log in as Admin
2. Check dashboard KPIs
3. Open pending approval requests
4. Filter by department or MO
5. Search for a specific module
6. Review workload and budget status
7. Approve or reject requests
8. Check updated records in history
9. Review analytics charts

---

## Testing

Recommended test coverage for the Admin module includes:

* dashboard data loading
* request list rendering
* approval/rejection logic
* batch operations
* filter and search accuracy
* history record storage
* budget badge calculation
* invalid file / malformed data handling

The coursework also requires test programs and documented testing as part of the final submission. 

---

## Agile Development

This project follows **Agile development practices** required by the module, including iterative planning, prioritisation, incremental delivery, and version-controlled collaboration. GitHub activity such as branches, commits, pull requests, and README updates serves as evidence of contribution. 

Possible iteration plan for the Admin module:

* **Iteration 1**: dashboard prototype + approval table UI
* **Iteration 2**: approval logic + filtering/search
* **Iteration 3**: analytics and chart integration
* **Iteration 4**: history, polishing, bug fixes, and testing

---

## AI Usage

AI tools may be used to support brainstorming, prototyping, debugging, testing, and documentation drafting. However, according to the coursework brief, AI-generated content should be reviewed critically and modified appropriately rather than accepted blindly. 

---

## Limitations

* File-based storage is simple but less scalable
* Concurrent editing support is limited
* Analytics depend on the correctness of input data files
* Some workflows may be simplified for prototype purposes

These trade-offs are acceptable within the coursework constraints. 

---

## Future Improvements

* smarter workload balancing
* export reports to CSV/PDF
* richer analytics and interactive charts
* role-based access refinement
* explainable AI recommendations
* notification support for approval results

---

## Contribution

This project is completed as part of a group coursework submission for **EBU6304 – Software Engineering Group Project**.

### Member Responsibilities

* Admin dashboard
* Data overview
* Approval management
* Filter/search functions
* Approval history
* Visual analytics

---

## Submission Checklist

The final coursework submission should include:

* source code
* test programs
* code documentation
* user manual with screenshots
* README with setup and running instructions 

---

## License

This project is developed for academic coursework use.

```

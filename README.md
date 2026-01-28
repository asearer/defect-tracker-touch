
# 🏭 Manufacturing Defect Tracking & Quality Execution System (QES)

A **production-grade, touch-enabled manufacturing defect tracking system** designed to replace paper-based defect logs and demonstrate **real-world MES/QMS design**, audit readiness, and shop-floor usability.

This project models how **Tier-1 manufacturers** capture defects, perform root cause analysis, and drive continuous improvement — not a simplified demo or tutorial app.

---

## 🚀 Why This Project Matters

Most manufacturing “demos” stop at basic CRUD screens.
This system was intentionally designed as a **feature-complete Quality Execution System (QES)** that reflects:

* Real operator workflows
* Real quality engineering practices
* Real audit and traceability requirements
* Real production constraints

It is suitable for:

* Professional portfolios
* Technical interviews
* Manufacturing digital transformation discussions
* Live hosted demos

---

## ✨ Key Capabilities

### 🧤 Touch-Optimized Shop-Floor Interface

* Designed for **gloved operation**
* Large touch targets, high contrast, dark mode
* **<5 second defect logging** workflow
* Automatic capture of:

  * Timestamp
  * Machine
  * Station
  * Shift
  * Operator

---

### 🧩 Structured Defect Taxonomy

Uses **manufacturing-native terminology**, not generic labels.

**Defect Categories Include:**

* Molding defects (Short Shot, Flash, Sink, Warp, Gas Burn, Weld Lines)
* Dimensional defects
* Material defects
* Cosmetic defects
* Secondary operation defects
* Handling and damage

This enables **accurate Pareto analysis** and meaningful trend detection.

---

### 🧪 Quality Review & Disposition

* Centralized defect queue by line, machine, or shift
* Defect reclassification with full audit trail
* Disposition handling:

  * Scrap
  * Rework
  * Use As Is
* Electronic signatures
* Controlled defect lifecycle:

  * Open → Under Review → Contained → Closed

---

### 🛠 Root Cause Analysis & CAPA

* Structured **5-Why** root cause analysis
* Cause categories aligned with manufacturing standards:

  * Man, Machine, Method, Material, Measurement, Environment
* Corrective Action (CAPA) management:

  * Ownership
  * Due dates
  * Effectiveness verification
* Direct linkage between defects, root causes, and machines

---

### 📊 Real-Time Analytics & Dashboards

Supervisor- and executive-ready dashboards including:

* Defects per Unit (DPU)
* First Pass Yield (FPY)
* Scrap rate by machine, defect, and shift
* Pareto charts
* Hourly defect trends
* Repeat defect detection

---

### 🧾 Audit & Traceability (ISO / IATF-Aligned)

* Immutable audit trails
* Full Who / What / When / Where tracking
* Electronic signatures
* Change history for all edits
* Lot, machine, and operator traceability

Designed with **ISO 9001 and IATF 16949 audit expectations** in mind.

---

## 🏗 Architecture Overview

```
Touch-Enabled Web Client (React)
        ↓
REST API (Backend Service)
        ↓
Quality & Audit Logic
        ↓
PostgreSQL Database
        ↓
Analytics & Dashboards
```

**Key Design Principles**

* Role separation
* Configuration over hardcoding
* Auditability by default
* Manufacturing-first workflows

---

## 🔐 Role-Based Access Control

| Role       | Capabilities                    |
| ---------- | ------------------------------- |
| Operator   | Log defects only                |
| Quality    | Review, reclassify, disposition |
| Supervisor | Dashboards & escalation         |
| Engineer   | Root cause & CAPA               |
| Admin      | System configuration            |

This separation mirrors real manufacturing quality systems.

---

## 🧰 Technology Stack

* **Frontend:** React (touch-optimized)
* **Backend:** REST API (Node.js / FastAPI / .NET)
* **Database:** PostgreSQL
* **Deployment:** Docker (local & cloud)
* **Auth:** Role-based authentication

---

## 🖥 Running the Demo Locally

```bash
docker-compose up
```

Then open:

```
http://localhost:3000
```

### Demo Users

* Operator
* Quality Engineer
* Supervisor
* Manufacturing Engineer
* Admin

Each role showcases different system capabilities.

---

## 🎯 What This Project Demonstrates

This project shows the ability to:

* Translate **manufacturing and quality requirements into software**
* Design **shop-floor UIs for real operators**
* Build **audit-ready, traceable systems**
* Apply **MES/QMS principles**, not just web patterns
* Deliver a **production-quality application**, not a prototype

---

## 📌 Future Enhancements

* OPC-UA / PLC integration (simulated)
* SPC charts
* Multi-plant support
* Mobile barcode / QR scanning
* ERP integration (ISA-95)

---






# Task Management System (Full-Stack Web)

[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## Overview
Task Management System is a Full-Stack Web application where users can register, log in, and manage their tasks efficiently.  
Built with a Node.js + TypeScript backend** and Next.js frontend, it allows users to **create, view, edit, delete, and toggle tasks, with filtering, searching, and pagination features.

---

## Features

### Backend (Node.js + TypeScript)
- **User Security & Authentication**
  - Registration, Login, and Logout
  - JWT-based authentication (Access & Refresh Tokens)
  - Passwords hashed securely using bcrypt
  - Endpoints: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`

- **Task Management (CRUD)**
  - Tasks linked to logged-in users
  - Endpoints:
    - `/tasks` (GET/POST) – list and create tasks
    - `/tasks/:id` (GET/PATCH/DELETE) – view, update, delete tasks
    - `/tasks/:id/toggle` – toggle task status
  - Pagination, filtering, and search features

- **Technical Requirements**
  - TypeScript
  - SQL Database with ORM (Prisma/TypeORM)
  - Proper validation & error handling (HTTP status codes)

---

### Frontend (Next.js + TypeScript)
- **Authentication**
  - Login & Registration pages
  - Token management for persistent sessions

- **Task Dashboard**
  - Display tasks with filtering & search
  - Responsive design for desktop & mobile

- **CRUD Operations**
  - Add, Edit, Delete, Toggle task status
  - Toast notifications for operations

---

## Tech Stack
- Backend: Node.js, TypeScript, Express.js, Prisma/TypeORM, SQL Database  
- Frontend:Next.js (App Router), TypeScript, CSS / Tailwind  
- Authentication: JWT, bcrypt  
- Tools: Git, GitHub, VS Code  

---

## Screenshots

<img width="1841" height="922" alt="task" src="https://github.com/user-attachments/assets/b75dc070-21d7-48dc-9df0-a5df4d37b7f8" />
<img width="1843" height="927" alt="Screenshot 2025-11-24 172140" src="https://github.com/user-attachments/assets/5e203967-ff7a-45e4-974e-1dc2a9583727" />
<img width="1841" height="922" alt="Screenshot 2025-11-24 190708" src="https://github.com/user-attachments/assets/64af476a-0bc3-4751-8b01-06036dfd1eae" />




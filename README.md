# Citizen Complaint & Local Administration Portal

A modern civic complaint and local administration platform for transparent issue reporting, authority routing, and rural area accountability.

## Highlights

- Citizen complaint filing with image upload and GPS location
- Automated complaint classification and routing
- Officer dashboard with SLA tracking
- Admin dashboard with performance insights
- AI-assisted complaint triage
- Rural and ward-specific complaint flow
- Modern 3D-inspired UI with responsive design
- Local-first demo ready setup

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: SQLite for easy local development (PostgreSQL ready to upgrade)
- AI Layer: rule-based smart complaint analysis

## Project Structure

- `client/` — React frontend
- `server/` — Express backend and SQLite database
- `docs/` — project documentation and architecture notes

## Quick Start

1. Install dependencies:

   ```bash
   npm install --prefix client
   npm install --prefix server
   ```

2. Start the backend:

   ```bash
   npm run dev --prefix server
   ```

3. Start the frontend:

   ```bash
   npm run dev --prefix client
   ```

4. Open in browser:

   ```text
   http://localhost:5173
   ```

5. Default login users:

   - Admin: admin@portal.com / admin123
   - Officer: officer@portal.com / officer123
   - Citizen: citizen@portal.com / citizen123

## Example Role Flow

1. Citizen logs in and files a complaint with location and photo details
2. AI engine analyzes complaint content and suggests category + department
3. System routes complaint to the matching authority
4. Officer sees the complaint in assigned queue
5. Officer updates status or escalates if unresolved
6. Admin reviews analytics and accountability dashboard

## Future Expansion

- Real PostgreSQL database integration
- Google Maps / OpenStreetMap GPS visualization
- SMS and email notification service
- Multi-language support (Marathi/Hindi/English)
- Anonymous complaint reporting
- RTI draft automation

## Repository Notes

This is designed as a strong academic and demo-ready project with a practical rural governance focus.

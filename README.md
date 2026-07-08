# MBA Batch Hub

A private space for your MBA batch — shared study notes, photo memories, and a group study planner.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas (Mongoose)
- **Storage:** Cloudinary (photos)

## Features

- Open signup — anyone with the link can join the batch
- **Notes:** create and share study notes by subject and semester
- **Photos:** album-based photo sharing for batch memories
- **Planner:** shared task tracker for case studies, deadlines, exams and interview prep
- Dark mode

## Setup

1. **Server**
   ```bash
   cd server
   npm install
   cp .env.example .env   # fill in your MongoDB Atlas + Cloudinary credentials
   npm run dev            # runs on http://localhost:5001
   ```

2. **Client**
   ```bash
   cd client
   npm install
   cp .env.example .env
   npm run dev            # runs on http://localhost:5173
   ```

## Notes

- All content is visible to every registered user; only the author/uploader/creator can edit or delete their own items.
- Photo uploads are capped at 10MB, images only.
- Auth endpoints are rate-limited (20 requests / 15 min).

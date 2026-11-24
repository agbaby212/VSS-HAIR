# VSS Hair

A Nigerian beauty business website. Customers order hair online, send the order to the owner on WhatsApp and pay her bank account directly. They can also book salon or home-service appointments.

## Structure

- `client/`: React + Vite + TypeScript + Tailwind CSS (hosted on Vercel)
- `server/`: Node + Express + TypeScript + PostgreSQL (hosted on Render). Created in BE-T1
- `docs/`: task files and handoff files

## Run the client

    cd client
    cp .env.example .env.local
    npm install
    npm run dev

## Checks to run before every commit

    npm run lint
    npm run typecheck
    npm run test
    npm run build
# Frontend

Next.js application for the Ortopedia clinic workspace.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run typecheck
```

## Environment

Copy the example file and point it to the backend base URL:

```bash
cp .env.example .env.local
```

Required variable:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Folder Notes

- `app`: Routes, pages, and layouts
- `components`: Shared UI components
- `hooks`: Reusable client hooks
- `lib`: API client, clinic context, and domain helpers


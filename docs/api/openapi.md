# API Spec Notes

Base URL: `/api/v1`

## Authentication

- `POST /auth/register`
	- Body: `{ "fullName": "string", "email": "string", "password": "string (>=8)", "role": "Student|Professional|Writer" }`
	- Returns: `{ "token": "access-jwt", "user": { ... } }`
	- Sets HttpOnly refresh cookie.

- `POST /auth/login`
	- Body: `{ "email": "string", "password": "string" }`
	- Returns: `{ "token": "access-jwt", "user": { ... } }`
	- Sets HttpOnly refresh cookie.

- `POST /auth/refresh`
	- Body: `{}`
	- Requires valid refresh cookie.
	- Returns: `{ "token": "new-access-jwt", "user": { ... } }`
	- Rotates refresh cookie.

- `POST /auth/logout`
	- Body: `{}`
	- Invalidates refresh session server-side.
	- Clears refresh cookie.
	- Returns `204`.

- `GET /auth/me`
	- Header: `Authorization: Bearer <access-jwt>`
	- Returns current authenticated user profile.

## Health

- `GET /health`
	- Returns service status and timestamp.

## Sessions

- `POST /sessions/start`
	- Header: `Authorization: Bearer <access-jwt>`
	- Body: `{}`
	- Returns: `{ "sessionId": "uuid", "status": "active" }`

- `POST /sessions/:sessionId/ingest`
	- Header: `Authorization: Bearer <access-jwt>`
	- Body:
		- `text: string`
		- `metrics: { totalCharacters, totalWords, totalKeystrokes, deletionCount, pasteCount, pastedCharacters, revisionCount, punctuationPauseCount, averagePauseMs, longestPauseMs, pauseDistribution, speedSamples }`
	- Returns intermediate analysis blocks for behavior, text, and cross-verification.

- `POST /sessions/:sessionId/end`
	- Header: `Authorization: Bearer <access-jwt>`
	- Finalizes session and generates authenticity report.

- `GET /sessions/:sessionId`
	- Header: `Authorization: Bearer <access-jwt>`
	- Fetches stored session record.

## Reports

- `GET /reports/session/:sessionId`
	- Header: `Authorization: Bearer <access-jwt>`
	- Returns full authenticity report.

- `GET /reports/share/:shareToken`
	- Returns share-safe report summary.

## Notes

- Raw keystroke content is never stored.
- ML prediction runs via HTTP service (`ML_SERVICE_URL`) or local Python fallback script (`ml/inference/predict.py`).
- Refresh tokens are stored in secure HttpOnly cookies and rotated on `/auth/refresh`.

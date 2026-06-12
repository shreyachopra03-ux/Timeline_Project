# Archive API's

# Auth API's ( handled using Clerk )
POST /api/webhooks/clerk

# Photos API
POST /photos/upload 
POST /photos/upload-bulk
GET /photos/timeline
GET /photos/timeline?from=&to=
<!-- GET /photos/:id -->
PATCH /photos/:id
DELETE /photos/:id
DELETE /photos/bulk-delete

# Clips API
POST /clips/generate
GET /clips
GET /clips/:id
PUT /clips/:id/rename
DELETE /clips/:id

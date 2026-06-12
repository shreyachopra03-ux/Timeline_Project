# Archive API's

# Auth API's ( handled using Clerk )
POST /api/webhooks/clerk

# Photos API
POST /media/upload 
POST /media/upload-bulk
GET /media/timeline
GET /media/timeline?from=&to=
<!-- GET /photos/:id -->
PATCH /media/:id
DELETE /media/:id
DELETE /media/bulk-delete

# Clips API
POST /clips/generate
GET /clips
GET /clips/:id
PUT /clips/:id/rename
DELETE /clips/:id


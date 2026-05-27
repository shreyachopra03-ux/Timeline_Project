# Archive API's

# Auth API's ( handled using Clerk )
POST /api/webhooks/clerk

# Photos API
POST /photos/upload 
POST /photos/upload-bulk
GET /photos/timeline
GET /photos/timeline?from=&to=
GET /photos/:id
PUT /photos/:id
DELETE /photos/:id
DELETE /photos/bulk-delete
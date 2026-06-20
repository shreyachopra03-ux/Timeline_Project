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

# Sharing API's
POST /shared/create
GET /shared
GET /shared/:id
POST /shared/:id/add-photo
DELETE /shared/:id/remove-photo/:photoId
POST /shared/:id/invite
DELETE /shared/:id/remove-member/:userId
DELETE /shared/:id

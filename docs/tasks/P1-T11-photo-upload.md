# P1-T11: Photo Upload (S3 Presigned URLs)

> **Phase:** 1 — Core MVP
> **Status:** ⬜ Not Started
> **Dependencies:** P1-T03, P1-T10
> **Estimated Time:** 3 hours

## Objective

Implement server-side photo upload via S3 presigned URLs, create ListingImage records, and handle image ordering.

## Scope

### Backend Endpoints

- `POST /api/uploads/presign` — Generate presigned S3 upload URL
  - Input: `{ fileName, fileType, listingId }`
  - Output: `{ uploadUrl, key, publicUrl }`
- `POST /api/listings/:id/images` — Create ListingImage records after upload
  - Input: `{ images: [{ key, url, order }] }`
- `PATCH /api/listings/:id/images/reorder` — Update image order
- `DELETE /api/listings/:id/images/:imageId` — Remove an image

### S3 Configuration

- Bucket: `kaarplus-images` in `eu-central-1`
- Key format: `listings/{listingId}/{uuid}.{ext}`
- Content-Type validation on presigned URL
- Max file size: 10MB
- Public read access for published images

### Client-Side Upload Flow

1. User selects files in dropzone (P1-T10 step 3)
2. Client validates file type and size
3. Client requests presigned URL from API
4. Client uploads directly to S3 using presigned URL
5. On success, client calls API to create ListingImage record
6. Thumbnail preview shown from S3 URL

### Image Processing (Optional Enhancement)

- Client-side compression before upload (reduce to max 2000px width)
- Generate thumbnail URL via S3/CloudFront transformation (future)

## Acceptance Criteria

- [ ] Presigned URLs generated correctly
- [ ] Files upload directly to S3 from browser
- [ ] ListingImage records created with correct order
- [ ] Images can be reordered
- [ ] Images can be deleted (both S3 and database)
- [ ] File type and size validation works
- [ ] Upload progress shows in UI

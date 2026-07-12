const crypto = require('crypto');
const cloudinary = require('../../config/cloudinary');
const ContentItem = require('../../models/ContentItem');
const studioUpload = require('../../middleware/studioUpload');
const duplicateService = require('./duplicateService');
const analysisService = require('./analysisService');

// Multer memory buffers exceed the base64 data-URI comfort zone at 100 MB —
// stream to Cloudinary instead of the dataUri pattern used for avatars.
function uploadToCloudinary(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) =>
      err ? reject(err) : resolve(result)
    );
    stream.end(buffer);
  });
}

/**
 * Ingest one multer file: hash → dedupe check → Cloudinary → ContentItem.
 * Analysis is kicked off asynchronously; the caller responds immediately.
 */
async function ingestFile(file, user) {
  const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');
  const type = studioUpload.detectType(file);
  const exact = await duplicateService.findExact(hash);

  const result = await uploadToCloudinary(file.buffer, {
    folder: 'datad/studio',
    resource_type: 'auto',
    use_filename: true,
    unique_filename: true,
  });

  const item = await ContentItem.create({
    status: 'uploaded',
    file: {
      originalName: file.originalname,
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      mime: file.mimetype,
      type,
      size: file.size,
      hash,
      pageCount: result.pages,
    },
    duplicateOf: exact ? exact._id : undefined,
    duplicateKind: exact ? 'exact' : undefined,
    createdBy: user.userId,
  });

  // Fire-and-forget: the client polls GET /items/:id until ready_for_review.
  setImmediate(() => analysisService.analyze(item._id, file.buffer));

  return item;
}

module.exports = { ingestFile };

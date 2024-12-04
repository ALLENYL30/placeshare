const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const uuid = require('uuid/v1');

// S3 bucket configuration
const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
    region: bucketRegion,
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey
    }
});

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

// Custom multer storage to handle S3 upload
const uploadToS3 = multer({
    limits: { fileSize: 500000 }, // Limiting file size to 500KB
    storage: multer.memoryStorage(), // Store file in memory
    fileFilter: (req, file, cb) => {
        const isValid = !!MIME_TYPE_MAP[file.mimetype];
        let error = isValid ? null : new Error('Invalid mime type!');
        cb(error, isValid);
    }
}).single('image');  // Single file upload (image in this case)

// Combined middleware to handle file upload and S3 storage
const fileUpload = async (req, res, next) => {
    uploadToS3(req, res, async function (err) {
        if (err) {
            return next(new Error('Multer error: ' + err.message));
        }

        if (!req.file) {
            return next(new Error('No file provided!'));
        }

        const file = req.file;
        const fileExtension = MIME_TYPE_MAP[file.mimetype];
        const fileName = uuid() + '.' + fileExtension;

        try {
            const uploadParams = {
                Bucket: bucketName,
                Key: fileName,  // Folder in S3 and file name
                Body: file.buffer,           // The file buffer from multer
                ContentType: file.mimetype   // Correct MIME type
            };

            // Upload file to S3 using PutObjectCommand
            await s3.send(new PutObjectCommand(uploadParams));

            // Attach file URL to request for further processing (like storing in the database)
            req.fileLocation = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${fileName}`;

            next(); // Proceed to the next middleware
        } catch (err) {
            return next(new Error('Failed to upload file to S3: ' + err.message));
        }
    });
};

module.exports = fileUpload;

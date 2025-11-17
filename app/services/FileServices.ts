import fs from 'fs';
import path from 'path';

function getExtensionFromContentType(contentType: string): string {
    const mimeToExt: { [key: string]: string } = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'image/svg+xml': '.svg',
        'application/pdf': '.pdf',
        'text/plain': '.txt',
        'application/json': '.json',
    };
    return mimeToExt[contentType] || '';
}

export class FileUploadError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'FileUploadError';
    }
}


export async function saveFileDevelopmentEnv(formData: FormData) {
    if (process.env.NODE_ENV !== 'development') {
        throw new FileUploadError("Only Development environment can be called this function");
    }
    try {
        const file = formData.get('file') as File;
        const fileName = formData.get('filename') as string;
        const contentType = formData.get('contentType') as string;
        var additionalDir = formData.get('additionalDir') as string;
        if (!additionalDir) {
            additionalDir = ""
        }
        const extension = getExtensionFromContentType(contentType || file.type);
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 1000);
        const pathToSave: { [key: string]: string } = {
            '.jpg' : "images/",
            '.png' : "images/",
            '.gif' : "gifs/",
            '.webp' : "images/",
            '.svg' : "vectors/",
            '.pdf' : "docs/",
            '.txt' : "docs",
            '.json' : "docs/"
        };
        const finalFileName = `${timestamp}_${randomNum}${extension}`
        const uploadDir = path.join(process.cwd(), 'public/' + pathToSave[extension] + additionalDir);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filepath = path.join(uploadDir, finalFileName);
        fs.writeFileSync(filepath, buffer);
        console.log(`[Development] File saved: ${finalFileName} (${contentType})`);
    } catch (err) {
        console.log(err);
        throw new FileUploadError("Failed to upload file");
    }


}
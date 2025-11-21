import fs from 'fs';
import path from 'path';

export function getExtensionFromContentType(file: File): string {
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
    return mimeToExt[file.type] || '';
}

export class FileUploadError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'FileUploadError';
    }
}

export function getImageStorePath(file: File, additionalDir: string): string {
    if (process.env.NODE_ENV === 'development') {
        const pathToSave: { [key: string]: string } = {
            '.jpg': "images/",
            '.png': "images/",
            '.gif': "gifs/",
            '.webp': "images/",
            '.svg': "vectors/",
            '.pdf': "docs/",
            '.txt': "docs",
            '.json': "docs/"
        };
        const extension = getExtensionFromContentType(file);
        return path.join(process.cwd(), "public/" + pathToSave[extension] + additionalDir);
    } else {
        return ""; // This is for production env
    }
}

export async function saveImage(image: File, dir: string, filename: string): Promise<string> {
    try {
        if (!dir) {
            dir = ""
        }
        const uploadDir = getImageStorePath(image, dir);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const extension = getExtensionFromContentType(image);
        const filepath = path.join(uploadDir, filename) + extension;
        fs.writeFileSync(filepath, buffer);
        console.log(`[Development] File saved: ${filename} (${extension})`);
        return filepath;
    } catch (err) {
        console.log(err);
        throw new FileUploadError("Failed to upload file");
    }
}

export function deleteImages(imagePaths: string[]): void {
    try {
        for (const imagePath of imagePaths) {
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log(`[Development] File deleted: ${imagePath}`);
            }
        }
    } catch (err) {
        console.error('Error deleting images:', err);
        throw new FileUploadError("Failed to delete images");
    }
}
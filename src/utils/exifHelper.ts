import exifr from "exifr";

export const getPhotoDate = async (fileBuffer: Buffer) => {

    try {
        const metadata = await exifr.parse(fileBuffer, { pick: ['DateTimeOriginal'] });

        if(metadata && metadata.DateTimeOriginal) {
            // if date & time exists, return it in a date object format.
            return new Date(metadata.DateTimeOriginal); 
        }
    } catch (err) {
        console.log("EXIF data not found, so falling back to the current date.");
    }
    return new Date();
};


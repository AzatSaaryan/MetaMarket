import multer from "multer";
const upload = multer({ dest: "uploads/" });
export const uploadImageMiddleware = upload.single("image");

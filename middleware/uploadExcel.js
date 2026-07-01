import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = "uploads/excel";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/excel");
  },

  filename(req, file, cb) {
    cb(
      null,
      `${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowed =
    file.mimetype.includes("sheet") ||
    file.originalname.endsWith(".xlsx") ||
    file.originalname.endsWith(".xls");

  if (allowed) {
    cb(null, true);
  } else {
    cb(new Error("Only Excel files allowed"));
  }
};

export const uploadExcel = multer({
  storage,
  fileFilter,
});
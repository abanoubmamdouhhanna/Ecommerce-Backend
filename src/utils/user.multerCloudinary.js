import multer from "multer";
const fileValidation = () => {
  return (req, file, cb) => {
    if (
      (file.fieldname === "profile" && (file.mimetype === "image/png" || file.mimetype === "image/jpeg"))||
      (file.fieldname === "cover" && file.mimetype === "image/png")
    ) {
      return cb(null,true)
    } else {
      return cb(new Error("In-Valid format",{cause: 400}),false)
    }
  };
};


export function userFileUpload() {
  const storage = multer.diskStorage({});
  const fileFilter = fileValidation();
  const upload = multer({ fileFilter, storage });
  return upload;
}

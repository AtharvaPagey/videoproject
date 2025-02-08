import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // we can keep the original name bacause this process is so small that it
    // wont matter for collision...but ppl keep the unique name to avoid anything
  },
});

export const upload = multer({ storage });

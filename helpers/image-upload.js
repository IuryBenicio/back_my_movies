const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinaryConfig");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "usuarios_profile_picture",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
    public_id: (req, file) => {
      const id = Math.round(Math.random() * 10000000);
      return `${id} -${Date.now()}`;
    },
  },
});

const upload = multer({ storage });

module.exports = upload;

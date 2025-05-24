const cloudinary = require("./cloudinaryConfig");

const deleteImage = async (oldImagePublicId) => {
  if (oldImagePublicId) {
    return await cloudinary.v2.uploader.destroy(oldImagePublicId);
  }
  return;
};

const updateProfileImage = async (req, res, next) => {
  const oldImagePublicId = req.body.public_id;

  console.log(oldImagePublicId);

  if (oldImagePublicId) {
    await deleteImage(oldImagePublicId).then(() => {
      next();
    });
  }

  next();
};

module.exports = updateProfileImage;

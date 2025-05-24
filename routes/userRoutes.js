const express = require("express");
const UserController = require("../controllers/userController");
const uploadImage = require("../helpers/image-upload");
const updateImage = require("../helpers/updateProfileImage");

const router = express.Router();

router.post(
  "/register",
  uploadImage.single("image"),
  UserController.registerUser
);
router.post("/login", UserController.loginUser);
router.post("/logout", UserController.logoutUser);
router.patch("/editname/:id", UserController.editName);
router.patch("/editusername/:id", UserController.editUserName);
router.patch("/editemail/:id", UserController.editEmail);
router.patch("/editpassword/:id", UserController.editPassword);
router.post("/confirmpassword/:id", UserController.confirmPassword);
router.patch(
  "/uploadprofileimage/:id",
  updateImage,
  uploadImage.single("image"),
  UserController.updateProfileImage
);
router.delete("/deleteuser/:id", UserController.deleteUser);

module.exports = router;

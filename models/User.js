const { model } = require("mongoose");
const mongoose = require("../db/conn");
const { Schema } = mongoose;

const User = mongoose.model(
  "User",
  new Schema(
    {
      userName: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      password: {
        type: String,
        required: true,
      },
      profileImage: {
        public_id: {
          type: String,
          required: true,
        },
        path: {
          type: String,
          required: true,
        },
      },
      moovieLists: [
        {
          _id: {
            type: Schema.Types.ObjectId,
            ref: "MoovieList",
          },
          name: {
            type: Schema.Types.String,
            ref: "MoovieList",
          },
          description: {
            type: Schema.Types.String,
            required: "MoovieList",
          },
          date: {
            type: Date,
            default: Date.now,
            required: "Date",
          },
        },
      ],
    },
    { timestamps: true }
  )
);

module.exports = User;

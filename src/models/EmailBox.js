const { Schema, model } = require("mongoose");
const { EmailSchema } = require("./Email");

const EmailBoxesSchema = new Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    emails: {
      type: [EmailSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = EmailBox = model("EmailBox", EmailBoxesSchema);

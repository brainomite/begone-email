const {
  Schema,
  model,
  Schema: {
    Types: { ObjectId },
  },
} = require("mongoose");

const EmailBoxesSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    box: {
      type: [ObjectId],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = EmailBox = model("EmailBox", EmailBoxesSchema);

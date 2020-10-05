const {
  Schema,
  model,
  Schema: {
    Types: { ObjectId },
  },
} = require("mongoose");

const EmailBoxesSchema = new Schema(
  {
    _id: {
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

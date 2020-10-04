const {
  Schema,
  model,
  Schema: {
    Types: { ObjectId },
  },
} = require("mongoose");

const EmailSchema = new Schema(
  {
    id: [ObjectId],
    eml: Buffer,
    attachments: [Buffer],
    sender: String,
    subject: String,
    timestamp: { type: Date, default: Date.UTC },
    isRead: {type: Boolean, default: false},
  },
  {
    timestamps: true,
  }
);

module.exports = Email = model("Email", EmailSchema);

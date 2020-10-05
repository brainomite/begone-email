const {
  Schema,
  model,
} = require("mongoose");

const EmailSchema = new Schema(
  {
    to: String,
    from: String,
    subject: String,
    date: { type: Date, default: Date.UTC },
    htmlBody: String,
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = Email = model("Email", EmailSchema);

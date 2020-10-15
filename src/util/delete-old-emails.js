const EmailBox = require("../models/EmailBox");
const dayjs = require("dayjs");

const deleteOldEmails = async function deleteOldEmails(minutes) {
  const cutoff = dayjs().subtract(minutes, "minute").toDate();
  await EmailBox.updateMany(
    {
      emails: {
        $elemMatch: {
          date: {
            $lte: cutoff,
          },
        },
      },
    },
    { $pull: { emails: { date: { $lte: cutoff } } } }
  );
  await EmailBox.deleteMany({
    emails: { $size: 0 },
  });
};

module.exports = deleteOldEmails;

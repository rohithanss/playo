const { CronJob } = require("cron");

const EventPlayerModel = require("../models/EventPlayerModel");

// Rejecting all the players once the event starts

async function deletePendingRequests(eventId, eventDate) {
  let job = new CronJob(
    eventDate,
    async function () {
      await EventPlayerModel.updateMany(
        { eventId, playerStatus: "pending" },
        {
          playerStatus: "rejected",
        }
      );
      console.log("yo");
    },
    null,
    true
  );
}

module.exports = deletePendingRequests;

const mongoose = require("mongoose");

const eventPlayerSchema = mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  eventId: mongoose.Schema.Types.ObjectId,
  playerStatus: {
    type: String,
    enum: ["pending", "accepted", "cancelled", "rejected"],
    default: "pending",
  },
});

const EventPlayerModel = mongoose.model("eventPlayer", eventPlayerSchema);

module.exports = EventPlayerModel;

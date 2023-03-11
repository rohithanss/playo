const mongoose = require("mongoose");

const eventSchema = mongoose.Schema(
  {
    organizerId: String,
    eventName: { type: String, required: true },
    gameName: { type: String, required: true },
    venue: { type: String, required: true },
    city: { type: String, required: true },
    totalPlayersAllowed: { type: Number, required: true },
    acceptedPlayers: { type: Number, default: 0 },
    totalPlayersApplied: { type: Number, default: 0 },
    eventDate: { type: Date, required: true },
  },
  { timeStamp: true }
);

const EventModel = mongoose.model("event", eventSchema);

module.exports = EventModel;

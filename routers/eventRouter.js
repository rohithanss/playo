const { Router } = require("express");
const mongoose = require("mongoose");

const EventModel = require("../models/EventModel");
const EventPlayerModel = require("../models/EventPlayerModel");

const deletePendingRequests = require("../services/deletePendingRequests.js");

const eventRouter = Router();

// ===================================== GENERAL ENDPOINTS FOR EXPLORING EVENTS =============================

eventRouter.get("/", async (req, res) => {
  let current = new Date();

  try {
    let events = await EventModel.find({ eventDate: { $gte: current } }).sort({
      eventDate: 1,
    });

    // Converting date to IST

    events.forEach((el, i) => {
      let date = new Date(el.eventDate);
      let newDate = date.setTime(date.getTime() + 1000 * 60 * 60 * 5.5);
      events[i].eventDate = newDate;
    });

    res.status(200).send({ status: "success", data: events });
  } catch (err) {
    res.status(500).send({
      status: "error",
      msg: "some error occurred while fetching events",
    });
  }
});

eventRouter.get("/details/:eventId", async (req, res) => {
  let eventId = new mongoose.Types.ObjectId(req.params.eventId);

  try {
    let events = await EventModel.aggregate()
      .match({
        _id: eventId,
      })
      .lookup({
        from: "eventplayers",
        let: { id: "$_id" },
        pipeline: [
          {
            $match: {
              playerStatus: "accepted",
              $expr: {
                $and: [{ $eq: ["$eventId", "$$id"] }],
              },
            },
          },
        ],
        as: "users",
      })
      .lookup({
        from: "users",
        localField: "users.userId",
        foreignField: "_id",
        as: "players",
      })
      .project({
        "players.status": { $first: "$users.playerStatus" },
        "players.name": 1,
        "players.email": 1,
        eventName: 1,
        eventDate: 1,
        gameName: 1,
        venue: 1,
        city: 1,
        totalPlayersAllowed: 1,
        acceptedPlayers: 1,
        totalPlayersApplied: 1,
      });

    if (!events[0]) {
      res
        .status(400)
        .send({ status: "fail", msg: "No event exist for the given id" });
      return;
    }

    // Converting date to IST

    let date = new Date(events[0].eventDate);
    let newDate = date.setTime(date.getTime() + 1000 * 60 * 60 * 5.5);
    events[0].eventDate = new Date(newDate);

    res.status(200).send({ status: "success", data: events[0] });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "error",
      msg: "some error occurred while fetching events",
    });
  }
});

// ===================================== ENDPOINTS FOR THE PLAYERS WHO ARE JOINING EVENT =============================

// TO SEND REQUEST TO JOIN AN EVENT

eventRouter.post("/joinevent/:eventId", async (req, res) => {
  let eventId = req.params.eventId;
  let userId = req.body.userId;

  try {
    let alreadyExist = await EventPlayerModel.findOne({ eventId, userId });

    if (alreadyExist?.eventId && alreadyExist?.playerStatus != "cancelled") {
      res.status(400).send({
        status: "fail",
        msg: "your are already registered for the event",
      });
      return;
    }

    let eventPlayer = new EventPlayerModel({ eventId, userId });

    await eventPlayer.save();

    await EventModel.findByIdAndUpdate(eventId, {
      $inc: { totalPlayersApplied: 1 },
    });

    res
      .status(201)
      .send({ msg: "success", msg: "join event request sent successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "error",
      msg: "some error occurred while registering for event",
    });
  }
});

// TO CANCEL THE REQUEST OF JOINING AN EVENT, A PLAYER JOINED EARLIER

eventRouter.patch("/canceljoinrequest/:eventId", async (req, res) => {
  let eventId = req.params.eventId;
  let userId = req.body.userId;

  try {
    let requestExist = await EventPlayerModel.findOne({ eventId, userId });

    if (!requestExist?.eventId) {
      res.status(400).send({
        status: "fail",
        msg: "your have not registered for this event",
      });
      return;
    }

    await EventPlayerModel.findByIdAndUpdate(requestExist._id, {
      playerStatus: "cancelled",
    });

    if (requestExist.playerStatus == "accepted") {
      await EventModel.findByIdAndUpdate(eventId, {
        $inc: { acceptedPlayers: -1 },
      });
    }

    res
      .status(201)
      .send({ msg: "success", msg: "join request cancelled successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "error",
      msg: "some error occurred while withdrawing from event",
    });
  }
});

// TO SEE THE STATUS OF ALL THE EVENTS, A PLAYER JOINED

eventRouter.get("/mybookings", async (req, res) => {
  let userId = new mongoose.Types.ObjectId(req.body.userId);

  try {
    let myBookings = await EventPlayerModel.aggregate()
      .match({ userId })
      .lookup({
        from: "events",
        localField: "eventId",
        foreignField: "_id",
        as: "event",
      })
      .project({
        _id: -1,
        userId: 1,
        eventId: 1,
        playerStatus: 1,
        eventName: { $first: "$event.eventName" },
        venue: { $first: "$event.venue" },
        city: { $first: "$event.city" },
        eventDate: { $first: "$event.eventDate" },
        totalPlayersAllowed: { $first: "$event.totalPlayersAllowed" },
        acceptedPlayers: { $first: "$event.acceptedPlayers" },
      });

    myBookings.forEach((el, i) => {
      let date = new Date(el.eventDate);
      let newDate = date.setTime(date.getTime() + 1000 * 60 * 60 * 5.5);
      myBookings[i].eventDate = new Date(newDate);
    });

    res.status(200).send({ status: "success", myBookings });
  } catch (err) {
    res.status(500).send({
      status: "error",
      msg: "something went wrong while fetching player's bookings",
    });
  }
});

// ===================================== ENDPOINTS FOR THE EVENT ORGANIZERS =============================

// TO CREATE A NEW EVENT

eventRouter.post("/create", async (req, res) => {
  let organizerId = req.body.userId;
  console.log(organizerId);
  let payload = req.body;

  let startTime = payload.startTime;
  let endTime = payload.endTime;

  if (startTime == undefined || endTime == undefined) {
    res
      .status(400)
      .send({ status: "fail", msg: "startTime and endTime is required" });
    return;
  }

  // Join the event Date and start Time to create timestamp, and saving as eventDate in DB

  payload.eventDate = payload.eventDate + "T" + startTime;

  try {
    let event = new EventModel({ organizerId, ...payload });
    let saved = await event.save();
    let date = new Date(payload.eventDate);

    deletePendingRequests(saved._id, date); // Auto reject all the requests once the event starts

    res.status(201).send({ msg: "success", msg: "event created successfully" });
  } catch (err) {
    res.status(500).send({
      status: "error",
      msg: "some error occurred while creating event",
    });
  }
});

// TO SEE ALL THE EVENTS CREATED BY USER

eventRouter.get("/myevents", async (req, res) => {
  try {
    let events = await EventModel.find({ organizerId: req.body.userId }).sort({
      eventDate: 1,
    });

    // Converting date to IST

    events.forEach((el, i) => {
      let date = new Date(el.eventDate);
      let newDate = date.setTime(date.getTime() + 1000 * 60 * 60 * 5.5);
      events[i].eventDate = newDate;
    });

    res.status(200).send({ status: "success", data: events });
  } catch (err) {
    res.status(500).send({
      status: "error",
      msg: "some error occurred while fetching events",
    });
  }
});

// TO SEE THE ALL PLAYERS' DETAILS OF A SPECIFIC EVENT CREATED BY USER

eventRouter.get("/myevents/details/:eventId", async (req, res) => {
  let organizerId = req.body.userId;
  let eventId = new mongoose.Types.ObjectId(req.params.eventId);
  try {
    let events = await EventModel.aggregate()
      .match({
        _id: eventId,
        organizerId,
      })
      .lookup({
        from: "eventplayers",
        let: { id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$eventId", "$$id"] }],
              },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "players",
            },
          },
          {
            $project: {
              userId: 1,
              playerStatus: 1,
              name: { $first: "$players.name" },
              email: { $first: "$players.email" },
            },
          },
        ],
        as: "users",
      })

      .project({
        users: 1,

        eventName: 1,
        eventDate: 1,
        gameName: 1,
        venue: 1,
        city: 1,
        totalPlayersAllowed: 1,
        acceptedPlayers: 1,
        totalPlayersApplied: 1,
      });

    if (!events[0]) {
      res.status(400).send({ status: "fail", msg: "You are not authorized" });
      return;
    }

    // Converting date to IST

    let date = new Date(events[0].eventDate);
    let newDate = date.setTime(date.getTime() + 1000 * 60 * 60 * 5.5);
    events[0].eventDate = new Date(newDate);

    res.status(200).send({ status: "success", data: events[0] });
  } catch (err) {
    res.status(500).send({
      status: "error",
      msg: "some error occurred while fetching event detail",
    });
  }
});

// TO ACCEPT A PLAYER'S REQUEST, WHO APPLIED TO JOIN THE EVENT

eventRouter.patch("/myevents/acceptplayer/:eventId", async (req, res) => {
  let eventId = req.params.eventId;
  let userId = req.body.userId;
  let playerId = req.body.playerId;
  if (!playerId) {
    res.status(400).send({
      status: "fail",
      msg: "PlayerId must be provided",
    });
    return;
  }
  try {
    let requestExist = await EventPlayerModel.findOne({
      eventId,
      userId: playerId,
    });

    if (!requestExist?.eventId) {
      res.status(400).send({
        status: "fail",
        msg: "Not player found in the event correspondence to event id",
      });
      return;
    }

    let eventDetails = await EventModel.findOne({
      _id: eventId,
      organizerId: userId,
    });

    if (!eventDetails?._id) {
      res.status(401).send({ status: "fail", msg: "You are not authorized" });
      return;
    }
    console.log(
      eventDetails.totalPlayersAllowed - eventDetails.acceptedPlayers,
      eventDetails.totalPlayersAllowed,
      eventDetails.acceptedPlayers
    );

    if (eventDetails.totalPlayersAllowed - eventDetails.acceptedPlayers <= 0) {
      res.status(400).send({
        msg: "fail",
        msg: "All the spots for the event has been already filled",
      });
      return;
    }

    if (requestExist.playerStatus != "accepted") {
      await EventModel.findByIdAndUpdate(eventId, {
        $inc: { acceptedPlayers: 1 },
      });
    }

    await EventPlayerModel.findByIdAndUpdate(requestExist._id, {
      playerStatus: "accepted",
    });

    res.status(201).send({
      msg: "success",
      msg: "Player's join request accepted successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "error",
      msg: "some error occurred while accepting the player's request for event",
    });
  }
});

// TO REJECT A PLAYER'S REQUEST, WHO APPLIED TO JOIN THE EVENT

eventRouter.patch("/myevents/rejectplayer/:eventId", async (req, res) => {
  let eventId = req.params.eventId;
  let playerId = req.body.playerId;
  let userId = req.body.userId;
  try {
    let requestExist = await EventPlayerModel.findOne({
      eventId,
      userId: playerId,
    });

    if (!requestExist?.eventId) {
      res.status(400).send({
        status: "fail",
        msg: "Not player found in the event correspondence to event id",
      });
      return;
    }

    let isUpdated = await EventPlayerModel.findOneAndUpdate(
      { _id: requestExist._id, organizerId: userId },
      {
        playerStatus: "rejected",
      }
    );

    if (!isUpdated) {
      res.status(401).send({ status: "fail", msg: "You are not authorized" });
      return;
    }

    res.status(201).send({
      msg: "success",
      msg: "Player's join request rejected successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "error",
      msg: "some error occurred while rejecting the player's request for event",
    });
  }
});

module.exports = eventRouter;

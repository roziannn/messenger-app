const express = require("express");
const router = express.Router();

const { getUsersInRoom } = require("./users.js");

router.get("/", (req, res) => {
  res.send("Server is up and running...");
});

//router pengecekan nama apakah sudah ada di room atau blm
router.get("/checkUname", (req, res) => {
  const { name, room } = req.query;
  const usersInRoom = getUsersInRoom(room.trim().toLowerCase());

  const isNameTaken = usersInRoom.some((user) => user.name === name.trim().toLowerCase());

  if (isNameTaken) {
    return res.status(400).json({ error: "Username is already taken in this room." });
  }

  res.status(200).json({ message: "Username is available" });
});

module.exports = router;

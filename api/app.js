const express = require("express");
const app = express();
const admin = require("firebase-admin");
const serviceAccount = require("./servicekey.json");
const port = 3005;
app.use(express.json());
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();
const usercol = db.collection("users");
const menu = db.collection("menu");
const notification = db.collection("notifications");

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});
app.get("/menu", async (req, res) => {
  try {
    const usersSnapshot = await menu.get();
    const users = [];
    usersSnapshot.forEach((doc) => {
      users.push(doc.data());
    });
    return res.status(200).send(users);
  } catch (error) {
    return res.status(500).json({ error: "Failed to get users" });
  }
});
//if admin wants to view al the data about users
app.get("/admin", async (req, res) => {
  try {
    const usersSnapshot = await usercol.get();
    const users = [];
    usersSnapshot.forEach((doc) => {
      users.push(doc.data());
    });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: "Failed to get users" });
  }
});
app.get("/notification", async (req, res) => {
  try {
    const usersSnapshot = await notification.get();
    const users = [];
    usersSnapshot.forEach((doc) => {
      users.push(doc.data());
    });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: "Failed to get users" });
  }
});

//logib
app.post("/login", async (req, res) => {
  let mis = req.body.mis;
  let pass = req.body.password;

  if (!mis || !pass) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const usersSnapshot = await usercol.get();
    const users = [];
    usersSnapshot.forEach((doc) => {
      users.push(doc.data());
    });
    for (let i = 0; i < users.length; i++) {
      if (users[i].mis == mis) {
        if (pass == users[i].password) {
          return res.status(200).json({ message: "logged in" });
        } else {
          return res.status(401).json({ message: "wrong password" });
        }
      }
    }
    return res.status(404).json({ message: "account does not exist" });
  } catch (error) {
    return res.status(500).json({ error: "Server failed" });
  }
});

//signup
app.post("/signup", async (req, res) => {
  let mis = req.body.mis;
  let password = req.body.password;
  let mail = req.body.mail;
  if (!mis || !password || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const usersSnapshot = await usercol.get();
    const users = [];
    usersSnapshot.forEach((doc) => {
      users.push(doc.data());
    });
    for (let i = 0; i < users.length; i++) {
      if (users[i].mis == mis || users[i].mail == mail) {
        return res.status(400).json({ error: "Account exists, please login" });
      }
    }
    try {
      const newUser = await usercol.add({
        mis,
        password,
        mail,
      });
      return res.json({ id: newUser.id });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to add user" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Server failed" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

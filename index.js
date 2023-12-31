const express = require("express");
const app = express();
const admin = require("firebase-admin");
const serviceAccount = require("./google-services.json");
const schedule = require("node-schedule");
const dayjs = require("dayjs");
const cors = require('cors')
app.use(express.json());
app.use(cors());
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.post("/scheduler", (req, res) => {
  const { token, message, startDate, reminder } = req.body;
  let setReminder = startDate;
  if (reminder == "pass") {
    setReminder = dayjs(startDate)
      .subtract(15, "second")
      .format("YYYY-MM-DD HH:mm:ss");
  } else {
    setReminder = dayjs(startDate)
      .subtract(5, "minute")
      .format("YYYY-MM-DD HH:mm:ss");
  }

  schedule.scheduleJob(startDate, () => {
    const payload = {
      notification: {
        title: `${message} - Impact Todo List`,
        body: `⏰ Pengingat: ${message} Dimulai ${reminder == "pass" ? 'Saat Ini yaa.':'dalam 5 Menit lagi yaa'}`,
      },
      token: token,
    };

    console.log(payload);
    // Send the notification using FCM
    admin
      .messaging()
      .send(payload)
      .then(() => {
        console.log("Notification sent successfully");
      })
      .catch((error) => {
        console.error("Error sending notification:", error);
      });
  });

  return res.send({ message: "Notification scheduled successfully" });
});
app.listen(5050, () => {
  console.log(`Server is running.`);
});

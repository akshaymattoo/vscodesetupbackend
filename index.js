import express from "express";
const app = express();
import http from "http";
import cors from "cors";
import { service as UserExtensionDataService } from "./firebaseService.js";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

const server = http.createServer(app);

import rateLimit from "express-rate-limit";
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 12, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: function (req, res /*next*/) {
    return res.status(429).json({
      error: "You sent too many requests. Please wait a while then try again",
    });
  },
});

app.post("/extensions", limiter, async (req, res) => {
  try {
    const { name, extensions, id } = req.body;
    console.log(`Request from id [${id}]`);
    if (!name || !extensions || !id) {
      return res.status(400).send({ message: "Incomplete request" });
    }
    if (id.length < 50) {
      console.log(`Not proper id passed`);
      return res.status(400).send({ message: "Incomplete request" });
    }
    if (typeof extensions !== "object") {
      console.log(`Not proper extensions passed`);
      return res.status(400).send({ message: "Incomplete request" });
    }
    if (extensions && extensions.length === 0) {
      return res.status(400).send({
        message: "Incomplete request. Please provide proper extensions",
      });
    }
    const userDoc = {
      id: id,
      name: name,
      avatar: `https://api.dicebear.com/5.x/fun-emoji/svg?scale=50&seed=${
        name.split(" ")[0]
      }`,
      extensions: extensions,
    };

    // first try to get the user
    const user = await UserExtensionDataService.getUser(id);
    if (!user) {
      // if user is not present then add the user
      await UserExtensionDataService.addUser(userDoc);
      console.log(`Sucessfully added doc`);
    } else {
      await UserExtensionDataService.updateUserExtensions(id, extensions);
      console.log(`Sucessfully updated doc`);
    }
    res.status(200).send({
      message:
        "Sucessfully uploaded the data. Please visit vscodesetup.com/extensions to see what others have posted.",
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.get("/", function (req, res) {
  return res.send("Hello World");
});

server.listen(process.env.PORT || 3001, () => {
  console.log("SERVER IS RUNNING on ", process.env.PORT || 3001);
});

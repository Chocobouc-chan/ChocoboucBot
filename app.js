import tmi from "tmi.js";
import dotenv from "dotenv";
import { getChannelFromId, getUsersFromLogins } from "./service.js";
import constants from "./constant.js";
import OBSWebSocket from "obs-websocket-js";

const obs = new OBSWebSocket();
obs.connect({ address: "localhost:4444", password: process.env.OBS_PASSWORD });
dotenv.config();

// Define configuration **options
const opts = {
  identity: {
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
  },
  channels: ["chocoboucstream"],
};

// Create a client with our options
const client = new tmi.client(opts);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
const onMessageHandler = (channel, tags, message, self) => {
  if (self) {
    return;
  } // Ignore messages from the bot

  if (tags["first-msg"]) {
    client.say(channel, constants.welcome + tags["display-name"]);
  }

  const PREFIX = "!";
  let [command, ...args] = message.slice(PREFIX.length).split(/ +/g);
  // If the command is known, let's execute it
  switch (command) {
    case "test":
      client.say(channel, `test ${tags["display-name"]}`);
      break;
    case "so":
      so(channel, args[0]);
      break;
    case "meme":
      meme();
      break;
    default:
      break;
  }
};

const meme = () => {
  obs.send("SetBrowserSourceProperties", {
    source: "meme",
    is_local_file: true,
    local_file: "C:/Users/choco/Desktop/memes/incognitobnoby.webp",
    shutdown: true,
    render: true,
  });
  obs.send("SetSceneItemProperties", {
    item: "meme",
    visible: true,
  })
  setTimeout(
    () =>
      obs.send("SetSceneItemProperties", {
        item: "meme",
        visible: false,
      }),
    5000
  );
};

const so = async (channel, username) => {
  const { so1, so2, soLett1, soLett2, soLett3, noIdea } = constants;
  const responseFromGetUserId = await getUsersFromLogins([username]);
  const responseFromGetChannelId = await getChannelFromId(
    responseFromGetUserId.data[0].id
  );
  const lastPlayedGame = responseFromGetChannelId.data[0].game_name
    ? responseFromGetChannelId.data[0].game_name
    : noIdea;
  if (username.toLowerCase() === "lettwave") {
    client.say(
      channel,
      soLett1 +
        responseFromGetUserId.data[0].display_name +
        soLett2 +
        lastPlayedGame +
        soLett3
    );
  } else {
    client.say(
      channel,
      so1 + responseFromGetUserId.data[0].display_name + so2 + lastPlayedGame
    );
  }
};

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}
// Register our event handlers (defined below)
client.on("message", onMessageHandler);
client.on("connected", onConnectedHandler);

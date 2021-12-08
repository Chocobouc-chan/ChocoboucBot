import { getChannelFromId, getUsersFromLogins } from "./service.js";
import constants from "./constant.js";
import * as fs from "fs";
import * as utils from "./utils.js"

const obs = utils.connectObs()
const client = utils.connectToTwitch()

const memeFolder="C:/Users/choco/Desktop/memes/"
const excludedFileExtensions = ["webm", "mp4", "html"];
const alreadySeenThisMeme = []

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
    case "so":
      so(channel, args[0]);
      break;
    case "meme":
    case "cope":
    case "mood":
      displayMeme(memeFolder+command);
      break;
    default:
      break;
  }
};

const getFileNames = (folder) => {
  const files = fs.readdirSync(folder);
  const excludedFiles = [excludedFileExtensions, ...alreadySeenThisMeme]
  return files.filter(
    (fileName) =>
      !excludedFiles.some(exclude => fileName.includes(exclude))
  );
};

const displayMeme = (path) => {
  const memes = getFileNames(path);
  const meme = memes[utils.getRandomInt(memes.length)];
  alreadySeenThisMeme.push(meme)
  obs.send("SetBrowserSourceProperties", {
    source: "meme",
    is_local_file: true,
    local_file: `${path}/${meme}`,
    shutdown: true,
    render: true,
  });
  obs.send("SetSceneItemProperties", {
    item: "meme",
    visible: true,
  });
  setTimeout(
    () =>
      obs.send("SetSceneItemProperties", {
        item: "meme",
        visible: false,
      }),
    8000
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

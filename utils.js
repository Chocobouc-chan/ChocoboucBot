import tmi from "tmi.js";
import dotenv from "dotenv";
import OBSWebSocket from "obs-websocket-js";

dotenv.config();

export function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

export function connectObs() {
  const obs = new OBSWebSocket();
  obs.connect({
    address: "localhost:4444",
    password: process.env.OBS_PASSWORD,
  });
  return obs;
}

export function connectToTwitch() {
  const opts = {
    identity: {
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
    },
    channels: ["chocoboucstream"],
  };
  const client = new tmi.client(opts);
  client.connect();
  return client;
}

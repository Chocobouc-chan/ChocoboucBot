import fetch from "node-fetch";
import dotenv from "dotenv";
import fs from "node:fs/promises";
const tokenFileName = "./token.json";
import tokenFile from "./token.json"

dotenv.config();

const opts = {
  method: "GET",
  headers: {
    "Client-Id": process.env.CLIENT_ID,
    Authorization: `Bearer ${tokenFile.token}`,
  },
};

const refreshToken = async () => {
  const response = await fetch(
    `https://id.twitch.tv/oauth2/token--data-urlencode?grant_type=refresh_token&refresh_token=${tokenFile.token}&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.SECRET_ID}`,
    opts
  );

  tokenFile.token = response.json().refresh_token;

  fs.writetokenFile(
    tokenFileName,
    JSON.stringify(tokenFile),
    function writeJSON(err) {
      if (err) return console.log(err);
      console.log(JSON.stringify(tokenFile));
      console.log("writing to " + tokenFileName);
    }
  );
};

const validateToken = async () => {
  return await fetch("https://id.twitch.tv/oauth2/validate", opts);
};

const handleError = (error) => {
  if (error.status === "401") {
    refreshToken();
  } else {
    console.log("Error occured", error);
  }
};

const get = async (url, body = {}) => {
  try {
    await validateToken();
    return await fetch(url, opts).json().data;
  } catch (error) {
    handleError(error);
  }
};

export const getUsersFromLogins = async (users) => {
  let logins = "";
  users.map((login, index) => {
    logins += `${index !== 0 ? "&" : ""}login=${login}`;
  });
  return await get(`https://api.twitch.tv/helix/users?${logins}`, opts);
};

export const getChannelFromId = async (channelId) => {
  return await get(
    `https://api.twitch.tv/helix/channels?broadcaster_id=${channelId}`,
    opts
  );
};

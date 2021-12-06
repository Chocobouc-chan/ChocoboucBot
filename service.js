import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const opts = {
  method: "GET",
  headers: {
    "Client-Id": process.env.CLIENT_ID,
    Authorization: `Bearer ${process.env.TOKEN}`,
  },
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

const refreshToken = async () => {
  return await fetch(
    `https://id.twitch.tv/oauth2/token--data-urlencode?grant_type=refresh_token&refresh_token=${process.env.TOKEN}&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.SECRET_ID}`,
    opts
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

export const get = async (url, body = {}) => {
  fetch(url, opts)
    .then((response) => response.json().data)
    .catch(handleError);
};

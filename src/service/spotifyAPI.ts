import axios from "axios";
const url = require("url");
require("dotenv").config();

const getSpotifyToken = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const clientSecretString = Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_SECRET_KEY}`
      );
      const base64Encoded = clientSecretString.toString("base64");
      const params = new url.URLSearchParams({
        grant_type: "client_credentials",
      });

      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        params.toString(),
        {
          headers: {
            Authorization: `Basic ${base64Encoded}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      resolve(response.data.access_token);
    } catch (err) {
      reject(err);
    }
  });
};
const getTrackByISRC = (isrc, token) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get("https://api.spotify.com/v1/search", {
        params: { q: `isrc:${isrc}`, type: "track" },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const tracks = response.data.tracks.items;

      const popularTrack = tracks.reduce(
        (max, t) => (t.popularity > max.popularity ? t : max),
        tracks[0]
      );
      resolve({
        isrc: popularTrack.external_ids.isrc,
        image_url: popularTrack.album.images[0].url,
        title: popularTrack.name,
        artists: popularTrack.artists.map((artist) => ({
          spotifyId: artist.id,
          name: artist.name,
        })),
      });
    } catch (error) {
      reject(error);
    }
  });
};
module.exports = { getSpotifyToken, getTrackByISRC };

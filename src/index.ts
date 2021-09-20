import * as express from "express";
import { Request, Response } from "express";
import { createConnection } from "typeorm";
import { Track } from "./entity/Track";
import { Artist } from "./entity/Artist";
const bodyParser = require("body-parser");
const SpotifyAPI = require("./service/spotifyAPI");

// create typeorm connection
createConnection().then((connection) => {
  const trackRepository = connection.getRepository(Track);
  const artistRepository = connection.getRepository(Artist);

  // create and setup express app
  const app = express();
  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // add track record to DB
  app.post("/track", async function (req: Request, res: Response) {
    let isrc = req.body.isrc;
    if (!isrc) {
      return res.send("Please provide isrc in request body");
    }
    try {
      const token = await SpotifyAPI.getSpotifyToken();
      // query track meta data based on isrc
      const track = await SpotifyAPI.getTrackByISRC(isrc, token);

      // check if track with user provided isrc already exist in DB, if so skip
      const foundTrack = await trackRepository.findOne({ where: { isrc } });

      if (foundTrack) return res.send("successful!");

      // add new record to track table
      const newTrack = trackRepository.create({
        isrc: track.isrc,
        image_url: track.image_url,
        title: track.title,
      });
      await trackRepository.save(newTrack);

      // add new record to artist table
      track.artists.map(async (artist) => {
        let newArtist = artistRepository.create({
          spotifyId: artist.spotifyId,
          name: artist.name,
          track: newTrack,
        });
        await artistRepository.save(newArtist);
      });
      return res.send("successful!");
    } catch (err) {
      res.status(400).send(err.message);
    }
  });

  // read from DB
  app.get("/track", async function (req: Request, res: Response) {
    // read by "ISRC"
    if (req.query.isrc) {
      const foundTrack = await trackRepository
        .findOne({ where: { isrc: req.query.isrc } })
        .catch((err) => console.log(err));
      if (foundTrack) res.send(foundTrack);
      else
        return res.send(
          `Can't find track with isrc ${req.query.isrc} in the DB`
        );
    } else if (req.query.artist) {
      // read by artist
      const foundTracks = await artistRepository
        .createQueryBuilder("artist")
        .select("artist.name")
        .leftJoinAndSelect("artist.track", "track")
        .where("artist.name like :name", { name: "%" + req.query.artist + "%" })
        .getMany();
      return res.send(foundTracks.map((foundTrack) => foundTrack.track));
    } else {
      return res
        .status(400)
        .send("please provide parameter 'isrc' or 'artist'");
    }
  });

  // start express server
  app.listen(3000);
});

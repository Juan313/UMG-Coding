import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Track } from "./Track";

@Entity()
export class Artist {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: "varchar", length: 80 })
  spotifyId: string;

  @Column({ type: "varchar", length: 80 })
  name: string;

  @ManyToOne((type) => Track, (track) => track.artist)
  track: Track;
}

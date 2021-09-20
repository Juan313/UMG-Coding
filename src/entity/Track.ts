import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { Artist } from "./Artist";

@Entity()
export class Track {
  @PrimaryColumn()
  isrc: string;

  @Column({ type: "varchar", length: 200 })
  image_url: string;

  @Column({ type: "varchar", length: 200 })
  title: string;

  @OneToMany((type) => Artist, (artist) => artist.track)
  artist: Artist[];
}

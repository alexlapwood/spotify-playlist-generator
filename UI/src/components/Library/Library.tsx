import React from "react";

import Loader from "../Loader/Loader";
import LibraryPlaylist from "./LibraryPlaylist/LibraryPlaylist";

import "./Library.css";

interface Props {
  filterFunction?: Parameters<
    Array<SpotifyApi.PlaylistObjectSimplified>["filter"]
  >[0];
  selectPlaylist?: (playlistId?: string) => void;
  usersPlaylists?: SpotifyApi.PlaylistObjectSimplified[];
}

const Library: React.FunctionComponent<Props> = ({
  filterFunction,
  selectPlaylist,
  usersPlaylists,
}) => (
  <div className="Library">
    {usersPlaylists?.length === 0 && (
      <Loader style={{ margin: "3.75rem auto" }} />
    )}
    {usersPlaylists?.filter(filterFunction || (() => {})).map((playlist) => (
      <LibraryPlaylist
        key={playlist.id}
        playlist={playlist}
        selectPlaylist={selectPlaylist}
      />
    ))}
  </div>
);

export default Library;

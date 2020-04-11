import React from "react";
import cn from "classnames";

import { ReactComponent as PlaylistIcon } from "../../../svg/Playlist.svg";

import "./LibraryPlaylist.css";

interface Props {
  playlist: SpotifyApi.PlaylistObjectSimplified;
  selectPlaylist: (playlistId: string) => void;
  style?: React.CSSProperties;
}

export default class LibraryPlaylist extends React.PureComponent<Props> {
  public render() {
    const { playlist, selectPlaylist } = this.props;

    const playlistThumbnail = playlist.images[0] && playlist.images[0].url;

    return (
      <div
        className="LibraryPlaylist"
        onClick={() => selectPlaylist(playlist.id)}
        tabIndex={0}
      >
        {playlistThumbnail ? (
          <img
            alt=""
            className="LibraryPlaylist-thumbnail"
            src={playlistThumbnail}
            style={{ background: playlistThumbnail }}
          />
        ) : (
          <PlaylistIcon
            className={cn(
              "LibraryPlaylist-thumbnail",
              "LibraryPlaylist-thumbnail-missing"
            )}
          />
        )}
        <div className="LibraryPlaylist-details">
          <div className="LibraryPlaylist-name">{playlist.name}</div>
          <div className="LibraryPlaylist-owner">
            {playlist.owner.display_name}
          </div>
        </div>
      </div>
    );
  }
}

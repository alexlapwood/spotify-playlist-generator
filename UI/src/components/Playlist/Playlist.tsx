import React from "react";

import Loader from "../Loader/Loader";
import Track from "../Track/Track";

import { ReactComponent as PlaylistIcon } from "../../svg/Playlist.svg";

import "./Playlist.css";

interface Props {
  playlist: SpotifyApi.PlaylistObjectFull | SpotifyApi.PlaylistObjectSimplified;
}

interface State {
  hasMounted: boolean;
}

export default class Playlist extends React.PureComponent<Props, State> {
  public state = {
    hasMounted: false,
  };

  public componentDidMount() {
    setTimeout(() =>
      this.setState({
        hasMounted: true,
      })
    );
  }

  public render() {
    const { playlist } = this.props;

    const playlistThumbnail = playlist.images[0] && playlist.images[0].url;

    return (
      <div className="Playlist">
        <div className="Playlist-header">
          {playlistThumbnail ? (
            <img
              alt=""
              src={playlistThumbnail}
              style={{
                background: playlistThumbnail,
                color: "#888",
                height: "12.5rem",
                width: "12.5rem",
              }}
            />
          ) : (
            <PlaylistIcon
              style={{
                background: "#282828",
                boxShadow: "0 0 0.75rem rgba(0,0,0,.3)",
                color: "#b3b3b3",
                height: "12.5rem",
                padding: "4.5rem",
                width: "12.5rem",
              }}
            />
          )}

          <h2>
            <a href={playlist.external_urls.spotify}>{playlist.name}</a>
          </h2>
          <a
            className="Playlist-owner"
            href={playlist.owner.external_urls.spotify}
          >
            {playlist.owner.display_name}
          </a>
          <div className="Playlist-songCount">
            {playlist.tracks.total} songs
          </div>
        </div>
        {this.state.hasMounted && "items" in playlist.tracks ? (
          <div className="Playlist-tracks">
            {playlist.tracks.items.map((track, i) => {
              return <Track key={`${track.track.id}${i}`} {...track.track} />;
            })}
          </div>
        ) : (
          <Loader />
        )}
      </div>
    );
  }
}

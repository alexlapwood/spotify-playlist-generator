import React from "react";
import axios, { AxiosError } from "axios";

import TextInput from "../../TextInput/TextInput";

import Configuration from "../../Configuration/Configuration";

import storeContext, {
  Store,
  StoreContext,
} from "../../../contexts/StoreContext";

import "./ConfigurePlaylist.css";

interface ExtendedAxiosError<IRequest = any, IResponse = any>
  extends AxiosError<IResponse> {
  request?: IRequest;
}

export default class ConfigurePlaylist extends React.Component {
  static contextType = storeContext;

  public render() {
    const { setStore, store } = this.context as StoreContext;

    const readyToCreatePlaylist =
      (this.context as StoreContext).store.controlledInputValues
        .newPlaylistNameInput && this.getCurrentSourcePlaylistTracks();

    return (
      <div className="ConfigurePlaylist utility-page-width">
        <div
          style={{
            display: "grid",
            gridGap: "1.5rem",
            gridTemplateColumns: readyToCreatePlaylist ? "1fr auto" : "auto",
            margin: "1.5rem",
          }}
        >
          <TextInput
            inputProps={{
              onChange: (event) =>
                setStore({
                  controlledInputValues: {
                    ...store.controlledInputValues,
                    newPlaylistNameInput: event.target.value,
                  },
                }),
              placeholder: "New playlist name",
              value: store.controlledInputValues.newPlaylistNameInput,
            }}
          />
          {readyToCreatePlaylist && (
            <button onClick={this.onClickGeneratePlaylist}>Generate</button>
          )}
        </div>

        <Configuration />
      </div>
    );
  }

  private getCurrentSourcePlaylistTracks = () => {
    const {
      store: { playlists, sourcePlaylistId },
    } = this.context as StoreContext;

    const currentSourcePlaylist =
      sourcePlaylistId && playlists[sourcePlaylistId];

    if (currentSourcePlaylist && "items" in currentSourcePlaylist.tracks) {
      return currentSourcePlaylist.tracks.items;
    }

    return;
  };

  private onClickGeneratePlaylist = async () => {
    const { store, setStore } = this.context as StoreContext;

    const name = store.controlledInputValues.newPlaylistNameInput;
    const tracks = this.getCurrentSourcePlaylistTracks();

    if (name && tracks) {
      setStore({ currentStep: 2 });

      await this.createPlaylist(name, tracks, store.playlistPreferences);
    }
  };

  private createPlaylist = async (
    name: string,
    tracks: SpotifyApi.PlaylistTrackObject[],
    playlistPreferences: Store["playlistPreferences"]
  ) => {
    try {
      const playlist = (
        await axios.post(`/api/playlist/`, null, {
          data: { name, tracks, playlistPreferences },
        })
      ).data as SpotifyApi.PlaylistObjectSimplified;

      this.context.setStore({
        destinationPlaylistId: playlist.id,
      });
    } catch (e) {
      const error = e as ExtendedAxiosError<XMLHttpRequest>;
      if (error.response) {
        // The server responded with a non 2xx status code
        if (error.response.status === 401) {
          window.location.href = "/auth/login";
        }
        return;
      }
      if (error.request) {
        // The request was made but no response was received
        return;
      }
      // Something happened in setting up the request that triggered an error
    }
  };
}

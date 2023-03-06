import React from "react";

import axios, { AxiosError } from "axios";
// @ts-ignore
import { cloneDeep } from "lodash";
import Vibrant from "node-vibrant";

import storeContext, { defaultStore, Store } from "./StoreContext";

interface ExtendedAxiosError<IRequest = any, IResponse = any>
  extends AxiosError<IResponse> {
  request?: IRequest;
}

export default class StoreContextProvider extends React.Component<{}, Store> {
  public state = cloneDeep(defaultStore);

  public async componentDidMount() {
    await this.hydrateLibrary();
    await this.hydrateState();
  }

  public async componentDidUpdate(previousProps: {}, previousState: Store) {
    if (
      previousState.sourcePlaylistId !== this.state.sourcePlaylistId ||
      previousState.destinationPlaylistId !== this.state.destinationPlaylistId
    ) {
      await this.hydrateState();
    }
  }

  public render() {
    return (
      <storeContext.Provider
        value={{
          store: this.state,
          setStore: (newStore) => this.setState({ ...this.state, ...newStore }),
        }}
      >
        {this.props.children}
      </storeContext.Provider>
    );
  }

  private hydratePlaylist = async (
    playlistId: string,
    hydratePlaylistPreferences?: boolean
  ) => {
    try {
      const { genres, ...data } = (
        await axios.get(`/api/playlist/${playlistId}`)
      ).data as SpotifyApi.PlaylistObjectFull & { genres: string[] };

      const artistsSimple = data.tracks.items
        .map(({ track }) => track.artists)
        .flat();

      const artists = artistsSimple.reduce((acc, artist) => {
        acc[artist.id] = {
          appearances: (acc[artist.id]?.appearances || 0) + 1,
          name: artist.name,
        };
        return acc;
      }, {} as { [key: string]: { appearances: number; name: string } });

      const sortedArtistKeys = Object.keys(artists).sort(
        (a, b) => artists[b].appearances - artists[a].appearances
      );

      // TODO: Remove code duplication from here, SelectPlaylist, and Configuration
      this.setState({
        playlistPreferences: hydratePlaylistPreferences
          ? {
              ...this.state.playlistPreferences,
              artistFilters: {
                ...this.state.playlistPreferences.artistFilters,
                selectedGenres:
                  this.state.playlistPreferences.artistFilters.selectedGenres
                    .length === 0
                    ? [genres[0]]
                    : this.state.playlistPreferences.artistFilters
                        .selectedGenres,
              },
              discoveryPreferences: {
                ...this.state.playlistPreferences.discoveryPreferences,
                selectedArtists:
                  this.state.playlistPreferences.discoveryPreferences
                    .selectedArtists.length === 0
                    ? sortedArtistKeys.filter(
                        (artistKey) => artists[artistKey].appearances > 1
                      )
                    : this.state.playlistPreferences.discoveryPreferences
                        .selectedArtists,
              },
            }
          : this.state.playlistPreferences,
        playlists: {
          ...this.state.playlists,
          [playlistId]: {
            ...data,
            genres,
          },
        },
      });

      if (data.images[0]) {
        const palette = await Vibrant.from(data.images[0].url).getPalette();

        if (palette.DarkVibrant) {
          this.setState({
            playlistColors: {
              ...this.state.playlistColors,
              [playlistId]: palette.DarkVibrant.rgb,
            },
          });
        }
      }
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

  private hydrateLibrary = async () => {
    try {
      const usersPlaylists = (await axios.get(`/api/playlists`))
        .data as SpotifyApi.ListOfUsersPlaylistsResponse;

      const playlists = usersPlaylists.items.reduce(
        (acc, playlist) => {
          return { ...acc, [playlist.id]: playlist };
        },
        {} as {
          [index: string]: SpotifyApi.PlaylistObjectSimplified | undefined;
        }
      );

      this.setState({
        playlists: {
          ...playlists,
          ...this.state.playlists,
        },
        usersPlaylists: usersPlaylists.items,
      });

      usersPlaylists.items.forEach(async (playlist) => {
        if (!playlist.images[0]) {
          return;
        }

        const palette = await Vibrant.from(playlist.images[0].url).getPalette();

        if (palette.DarkVibrant) {
          this.setState({
            playlistColors: {
              ...this.state.playlistColors,
              [playlist.id]: palette.DarkVibrant.rgb,
            },
          });
        }
      });
    } catch (e) {
      const error = e as ExtendedAxiosError<XMLHttpRequest>;
      if (error.response) {
        if (error.response.status === 401) {
          window.location.href = "/auth/login";
        }
        return;
      }
      if (error.request) {
        return;
      }
      return;
    }
  };

  private hydrateState = () => {
    const { playlists, destinationPlaylistId, sourcePlaylistId } = this.state;
    if (sourcePlaylistId !== undefined) {
      const currentSourcePlaylist = playlists[sourcePlaylistId];
      if (
        currentSourcePlaylist === undefined ||
        "items" in currentSourcePlaylist === false
      ) {
        this.hydratePlaylist(sourcePlaylistId, true);
      }
    }
    if (destinationPlaylistId !== undefined) {
      const currentDestinationPlaylist = playlists[destinationPlaylistId];
      if (
        currentDestinationPlaylist === undefined ||
        "items" in currentDestinationPlaylist === false
      ) {
        this.hydratePlaylist(destinationPlaylistId);
      }
    }
  };
}

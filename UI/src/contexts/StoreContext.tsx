import React from "react";
import { cloneDeep } from "lodash";

export type Range = {
  min: number;
  max: number;
};

export interface Store {
  currentStep: number;
  playlistPreferences: {
    discoveryPreferences: {
      copyPlaylistSongs: boolean;
      excludePlaylistArtists: boolean;
      includeRelatedArtists: boolean;
      numberOfSongs: number;
      selectedArtists: string[];
    };
    sortPreferences: {
      sortBy: keyof Store["playlistPreferences"]["songFilters"]["ranges"];
      sortDirection: "ascending" | "descending";
    };
    artistFilters: {
      selectedGenres: string[];
      popularity: Range;
    };
    songFilters: {
      removePlaylistSongs: boolean;
      ranges: {
        acousticness: Range;
        danceability: Range;
        energy: Range;
        instrumentalness: Range;
        liveness: Range;
        popularity: Range;
        speechiness: Range;
      };
    };
  };
  controlledInputValues: {
    newPlaylistNameInput: string;
    searchArtistsInput: string;
    searchGenreInput: string;
    searchLibraryInput: string;
  };
  destinationErrorMessage?: string;
  destinationPlaylistId?: string;
  usersPlaylists: SpotifyApi.PlaylistObjectSimplified[];
  playlists: {
    [index: string]:
      | (SpotifyApi.PlaylistObjectFull & {
          genres: string[];
        })
      | SpotifyApi.PlaylistObjectSimplified
      | undefined;
  };
  playlistColors: {
    [index: string]: [number, number, number] | undefined;
  };
  sourceErrorMessage?: string;
  sourcePlaylistId?: string;
}

export const defaultStore: Store = {
  currentStep: 0,
  playlistPreferences: {
    discoveryPreferences: {
      copyPlaylistSongs: false,
      excludePlaylistArtists: false,
      includeRelatedArtists: false,
      numberOfSongs: 5,
      selectedArtists: [],
    },
    sortPreferences: {
      sortBy: "energy",
      sortDirection: "ascending",
    },
    artistFilters: {
      selectedGenres: [],
      popularity: {
        min: 0,
        max: 100,
      },
    },
    songFilters: {
      removePlaylistSongs: false,
      ranges: {
        acousticness: {
          min: 0,
          max: 100,
        },
        danceability: {
          min: 0,
          max: 100,
        },
        energy: {
          min: 0,
          max: 100,
        },
        instrumentalness: {
          min: 0,
          max: 100,
        },
        liveness: {
          min: 0,
          max: 100,
        },
        popularity: {
          min: 0,
          max: 100,
        },
        speechiness: {
          min: 0,
          max: 100,
        },
      },
    },
  },
  controlledInputValues: {
    newPlaylistNameInput: "",
    searchArtistsInput: "",
    searchGenreInput: "",
    searchLibraryInput: "",
  },
  destinationErrorMessage: undefined,
  destinationPlaylistId: undefined,
  usersPlaylists: [],
  playlistColors: {},
  playlists: {},
  sourceErrorMessage: undefined,
  sourcePlaylistId: undefined,
};

export interface StoreContext {
  store: Store;
  setStore: (store: Partial<Store>) => void;
}

const context: StoreContext = {
  store: cloneDeep(defaultStore),
  setStore: () => {},
};

export default React.createContext(context);

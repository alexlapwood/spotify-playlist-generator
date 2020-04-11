// @ts-check
import express from "express";

import SpotifyWebApi from "../helpers/SpotifyWebApi";
import { getRedirectUri, withFreshToken } from "../helpers/spotify";

import { clientId, clientSecret } from "../credentials.json";

import { Store, Range } from "../UI/src/contexts/StoreContext";

export const api = express.Router();

api.get("/playlists", async (req, res) => {
  await withFreshToken(req, res, async (cookies) => {
    const spotifyApi = new SpotifyWebApi({
      clientId,
      clientSecret,
      redirectUri: getRedirectUri(req),
      accessToken: JSON.parse(cookies.__session || "{}").accessToken,
      refreshToken: JSON.parse(cookies.__session || "{}").refreshToken,
    });

    try {
      const library = (await spotifyApi.getUserPlaylists()).body;

      while (library.items.length < library.total) {
        const playlists = (
          await spotifyApi.getUserPlaylists({
            offset: library.items.length,
          })
        ).body.items;

        library.items.push(...playlists);
      }

      return res.send(library);
    } catch (error) {
      console.error(error);
      return res.status(error.statusCode).send(error.statusMessage);
    }
  });
});

api.get("/playlist/:playlistId", async (req, res) => {
  await withFreshToken(req, res, async (cookies) => {
    const spotifyApi = new SpotifyWebApi({
      clientId,
      clientSecret,
      redirectUri: getRedirectUri(req),
      accessToken: JSON.parse(cookies.__session || "{}").accessToken,
      refreshToken: JSON.parse(cookies.__session || "{}").refreshToken,
    });

    try {
      const playlist = (await spotifyApi.getPlaylist(req.params.playlistId))
        .body;

      while (playlist.tracks.items.length < playlist.tracks.total) {
        const tracks = (
          await spotifyApi.getPlaylistTracks(req.params.playlistId, {
            offset: playlist.tracks.items.length,
          })
        ).body;

        playlist.tracks.items.push(...tracks.items);
      }

      const artistsSimple = playlist.tracks.items
        .map(({ track }) => track.artists)
        .flat();

      const artistsAppearances = artistsSimple.reduce((acc, artist) => {
        const appearances = acc[artist.id] || 0;
        return {
          ...acc,
          [artist.id]: appearances + 1,
        };
      }, {} as { [key: string]: number });

      const artists = (
        await spotifyApi.getArtists(Object.keys(artistsAppearances))
      ).body.artists;

      const genresAppearances: { [key: string]: number } = {};

      artists
        .filter((artist) => artist)
        .forEach((artist) => {
          artist.genres.forEach((genre, i) => {
            const appearances = genresAppearances[genre] || 0;
            genresAppearances[genre] =
              appearances +
              artistsAppearances[artist.id] * (1 - i / artist.genres.length);
          });
        });

      const genres = Object.keys(genresAppearances).sort(
        (a, b) => genresAppearances[b] - genresAppearances[a]
      );
      // .slice(0, 50);

      return res.send({ ...playlist, genres });
    } catch (error) {
      console.log(error);
      return res.status(error.statusCode).send(error.statusMessage);
    }
  });
});

api.post("/playlist", async (req, res) => {
  await withFreshToken(req, res, async (cookies) => {
    const spotifyApi = new SpotifyWebApi({
      clientId,
      clientSecret,
      redirectUri: getRedirectUri(req),
      accessToken: JSON.parse(cookies.__session || "{}").accessToken,
      refreshToken: JSON.parse(cookies.__session || "{}").refreshToken,
    });

    try {
      const { name, playlistPreferences, tracks } = req.body as {
        name: string;
        playlistPreferences: Store["playlistPreferences"];
        tracks: SpotifyApi.PlaylistTrackObject[];
      };

      const {
        artistFilters,
        discoveryPreferences,
        songFilters,
        sortPreferences,
      } = playlistPreferences;

      console.log("get artists");
      // Get artists
      let selectedArtists = (
        await spotifyApi.getArtists(discoveryPreferences.selectedArtists)
      ).body.artists;

      console.log("get related artists");
      // Get related artists
      if (discoveryPreferences.includeRelatedArtists) {
        const promises = selectedArtists.map(
          async (artist) =>
            (await spotifyApi.getArtistRelatedArtists(artist.id)).body.artists
        );

        const relatedArtists = (await Promise.all(promises))
          .flat()
          .filter(
            (artist) =>
              !discoveryPreferences.selectedArtists.includes(artist.id)
          );

        selectedArtists.push(
          ...relatedArtists
            .sort(() => 0.5 - Math.random())
            .slice(
              0,
              Math.min(
                Math.max(
                  20 /
                    (discoveryPreferences.selectedArtists.length * 0.02 + 0.5),
                  1
                ),
                20
              )
            )
        );

        if (discoveryPreferences.excludePlaylistArtists) {
          const playlistArtistIds = tracks
            .map(({ track }) => track.artists)
            .flat()
            .map((artist) => artist.id);

          selectedArtists = selectedArtists.filter(
            (artist) => !playlistArtistIds.includes(artist.id)
          );
        }
      }

      console.log("filter artists");
      // Filter artists
      selectedArtists = selectedArtists.filter((artist) => {
        if (
          artist.popularity < artistFilters.popularity.min ||
          artist.popularity > artistFilters.popularity.max
        ) {
          return false;
        }

        if (
          artist.genres.find((genre) =>
            artistFilters.selectedGenres.includes(genre)
          )
        ) {
          return true;
        }

        return false;
      });

      console.log("get top songs", selectedArtists.length);
      // Get top songs
      const topSongsPromises = selectedArtists.map(async (selectedArtist) =>
        (
          await spotifyApi.getArtistTopTracks(selectedArtist.id, "from_token")
        ).body.tracks.map((track) => ({
          ...track,
          originalArtistId: selectedArtist.id,
        }))
      );

      let topSongs = (await Promise.all(topSongsPromises))
        .flat()
        .filter(
          (topSong) => topSong.artists[0].id === topSong.originalArtistId
        );

      // Copy playlist songs
      if (discoveryPreferences.copyPlaylistSongs) {
        const tracksToCopy = tracks.filter(
          (track) =>
            !topSongs.map((topSong) => topSong.id).includes(track.track.id)
        );

        topSongs.push(
          ...tracksToCopy.map((trackToCopy) => ({
            ...trackToCopy.track,
            originalArtistId: "",
          }))
        );
      }

      console.log("filter songs");
      // Filter songs
      if (songFilters.removePlaylistSongs) {
        const playlistTrackIds = tracks.map(({ track }) => track.id);

        topSongs = topSongs.filter(
          (topSong) => !playlistTrackIds.includes(topSong.id)
        );
      }

      const tracksAudioFeatures = (
        await spotifyApi.getAudioFeaturesForTracks(
          topSongs.map((topSong) => topSong.id)
        )
      ).body.audio_features.filter((audioFeatures) => audioFeatures);

      topSongs = topSongs.filter((topSong) => {
        if (
          topSong.popularity < songFilters.ranges.popularity.min ||
          topSong.popularity > songFilters.ranges.popularity.max
        ) {
          return false;
        }

        const audioFeatures = tracksAudioFeatures.find(
          (track) => track.id === topSong.id
        );

        if (!audioFeatures) {
          return false;
        }

        const failingAudioFeature = Object.entries(audioFeatures).find(
          ([audioFeatureKey, audioFeature]) => {
            const audioFeatureFilter = (songFilters.ranges as typeof songFilters.ranges & {
              [index: string]: Range;
            })[audioFeatureKey];

            if (!audioFeatureFilter) {
              return false;
            }

            if (
              audioFeature * 100 < audioFeatureFilter.min ||
              audioFeature * 100 > audioFeatureFilter.max
            ) {
              return true;
            }

            return false;
          }
        );

        if (failingAudioFeature) {
          return false;
        }

        return true;
      });

      console.log("reduce the number of songs per artist");
      // Reduce the number of songs per artist
      if (discoveryPreferences.numberOfSongs !== 10) {
        const artistsAppearances: { [key: string]: number } = {};

        topSongs = topSongs.filter((topSong) => {
          if (topSong.originalArtistId === "") {
            return true;
          }

          artistsAppearances[topSong.originalArtistId] =
            (artistsAppearances[topSong.originalArtistId] || 0) + 1;

          if (
            artistsAppearances[topSong.originalArtistId] >
            discoveryPreferences.numberOfSongs
          ) {
            return false;
          }

          return true;
        });
      }

      console.log("sort songs");
      // Sort songs
      topSongs = topSongs.sort((topSongA, topSongB) => {
        const audioFeaturesA = tracksAudioFeatures.find(
          (track) => track.id === topSongA.id
        );
        const audioFeaturesB = tracksAudioFeatures.find(
          (track) => track.id === topSongB.id
        );

        if (!audioFeaturesA || !audioFeaturesB) {
          return 0;
        }

        if (sortPreferences.sortBy === "popularity") {
          return topSongA.popularity - topSongB.popularity;
        }

        return (
          audioFeaturesA[sortPreferences.sortBy] -
          audioFeaturesB[sortPreferences.sortBy]
        );
      });

      if (sortPreferences.sortDirection === "descending") {
        topSongs = topSongs.reverse();
      }

      const userId = (await spotifyApi.getMe()).body.id;

      const newPlaylist = (
        await spotifyApi.createPlaylist(userId, name, {
          collaborative: false,
          public: false,
        })
      ).body;

      const trackUris = topSongs.map((track) => track.uri);

      const trackUriChunks: string[][] = [];

      while (trackUris.length) {
        trackUriChunks.push(trackUris.splice(0, 100));
      }

      for (const trackUriChunk of trackUriChunks) {
        await spotifyApi.addTracksToPlaylist(newPlaylist.id, trackUriChunk);
      }

      return res.send(newPlaylist);
    } catch (error) {
      console.log(error);
      return res.status(error.statusCode).send(error.statusMessage);
    }
  });
});

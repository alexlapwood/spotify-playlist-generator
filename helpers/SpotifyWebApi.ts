import SpotifyWebApiNode from "spotify-web-api-node";
import chunk from "./chunk";

type Unpacked<T> = T extends Promise<infer U> ? U : T;

const RETRIES = 10;

export default class SpotifyWebApi {
  private spotifyApi: SpotifyWebApiNode;

  constructor(credentials?: any) {
    this.spotifyApi = new SpotifyWebApiNode(credentials);
  }

  public addTracksToPlaylist = (
    ...parameters: Parameters<SpotifyWebApiNode["addTracksToPlaylist"]>
  ) =>
    this.doWithRetry<SpotifyWebApiNode["addTracksToPlaylist"]>(
      this.spotifyApi.addTracksToPlaylist,
      RETRIES,
      ...parameters
    );

  public createPlaylist = (
    ...parameters: Parameters<SpotifyWebApiNode["createPlaylist"]>
  ) =>
    this.doWithRetry<SpotifyWebApiNode["createPlaylist"]>(
      this.spotifyApi.createPlaylist,
      RETRIES,
      ...parameters
    );

  public getArtist = (
    ...parameters: Parameters<SpotifyWebApiNode["getArtist"]>
  ) =>
    this.doWithRetry<SpotifyWebApiNode["getArtist"]>(
      this.spotifyApi.getArtist,
      RETRIES,
      ...parameters
    );

  public getArtistRelatedArtists = (
    ...parameters: Parameters<SpotifyWebApiNode["getArtistRelatedArtists"]>
  ) =>
    this.doWithRetry<SpotifyWebApiNode["getArtistRelatedArtists"]>(
      this.spotifyApi.getArtistRelatedArtists,
      RETRIES,
      ...parameters
    );

  public getArtistTopTracks = (
    ...parameters: Parameters<SpotifyWebApiNode["getArtistTopTracks"]>
  ) =>
    this.doWithRetry<SpotifyWebApiNode["getArtistTopTracks"]>(
      this.spotifyApi.getArtistTopTracks,
      RETRIES,
      ...parameters
    );

  public getAudioFeaturesForTracks = async (
    ...parameters: Parameters<SpotifyWebApiNode["getAudioFeaturesForTracks"]>
  ) => {
    const audioFeaturePromises = chunk<typeof parameters[0]>(
      parameters[0],
      100
    ).map((audioFeatures) => {
      return this.doWithRetry<SpotifyWebApiNode["getAudioFeaturesForTracks"]>(
        this.spotifyApi.getAudioFeaturesForTracks,
        RETRIES,
        audioFeatures
      );
    });

    const audioFeatures = (await Promise.all(audioFeaturePromises))
      .map((response) => response.body.audio_features)
      .flat();

    return new Promise((resolve) =>
      resolve({
        body: { audio_features: audioFeatures },
        headers: {},
        statusCode: 200,
      })
    ) as ReturnType<SpotifyWebApiNode["getAudioFeaturesForTracks"]>;
  };

  public getArtists = async (
    ...parameters: Parameters<SpotifyWebApiNode["getArtists"]>
  ) => {
    const artistPromises = chunk<typeof parameters[0]>(parameters[0], 50).map(
      (artists) => {
        return this.doWithRetry<SpotifyWebApiNode["getArtists"]>(
          this.spotifyApi.getArtists,
          RETRIES,
          artists
        );
      }
    );

    const artists = (await Promise.all(artistPromises))
      .map((response) => response.body.artists)
      .flat();

    return new Promise((resolve) =>
      resolve({ body: { artists }, headers: {}, statusCode: 200 })
    ) as ReturnType<SpotifyWebApiNode["getArtists"]>;
  };

  public getMe = (...parameters: Parameters<SpotifyWebApiNode["getMe"]>) =>
    this.doWithRetry<SpotifyWebApiNode["getMe"]>(
      this.spotifyApi.getMe,
      RETRIES,
      ...parameters
    );

  public getPlaylist = (
    ...parameters: Parameters<SpotifyWebApiNode["getPlaylist"]>
  ) =>
    this.doWithRetry<SpotifyWebApiNode["getPlaylist"]>(
      this.spotifyApi.getPlaylist,
      RETRIES,
      ...parameters
    );

  public getPlaylistTracks = (
    ...parameters: Parameters<SpotifyWebApiNode["getPlaylistTracks"]>
  ) =>
    this.doWithRetry<SpotifyWebApiNode["getPlaylistTracks"]>(
      this.spotifyApi.getPlaylistTracks,
      RETRIES,
      ...parameters
    );

  public getUserPlaylists(
    ...parameters: Parameters<SpotifyWebApiNode["getUserPlaylists"]>
  ) {
    return this.doWithRetry<SpotifyWebApiNode["getUserPlaylists"]>(
      this.spotifyApi.getUserPlaylists,
      RETRIES,
      ...parameters
    );
  }

  private async doWithRetry<T extends (...args: any) => any>(
    callback: (
      ...parameters: Parameters<T>
    ) => Promise<Unpacked<ReturnType<T>>>,
    retries: number,
    ...parameters: Parameters<T>
  ): Promise<Unpacked<ReturnType<T>>> {
    try {
      const result = await callback.bind<
        (...parameters: any) => Promise<Unpacked<ReturnType<T>>>
      >(this.spotifyApi)(...parameters);
      return result;
    } catch (e) {
      if (retries > 0 && e.statusCode === 429 && e.headers["retry-after"]) {
        await new Promise((resolve) =>
          setTimeout(resolve, Number(e.headers["retry-after"]) * 1000)
        );
        return this.doWithRetry(callback, retries, ...parameters);
      }
      throw e;
    }
  }
}

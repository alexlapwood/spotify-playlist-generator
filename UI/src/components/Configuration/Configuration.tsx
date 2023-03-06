import React from "react";
import { FixedSizeList } from "react-window";

import CheckboxInput from "../CheckboxInput/CheckboxInput";
import NumberInput from "../NumberInput/NumberInput";
import RangeInput from "../RangeInput/RangeInput";
import TextInput from "../TextInput/TextInput";

import storeContext, { StoreContext, Store } from "../../contexts/StoreContext";

import "./Configuration.css";

interface Props {}

type PropsFromStore = ReturnType<typeof select>;

const artistRow = ({
  index,
  data,
  style,
}: {
  index: number;
  data: React.ComponentProps<typeof Configuration>;
  style: any;
}) => {
  const {
    artists,
    discoveryPreferences,
    filteredArtistKeys,
    setDiscoveryPreferences,
  } = data;

  const artistKey = filteredArtistKeys[index];

  const isChecked = discoveryPreferences.selectedArtists.includes(artistKey);

  return (
    <div style={style as React.CSSProperties}>
      <CheckboxInput
        id={`artist-${artistKey}`}
        isChecked={isChecked}
        onChange={() => {
          if (isChecked) {
            setDiscoveryPreferences({
              selectedArtists: discoveryPreferences.selectedArtists.filter(
                (selectedArtist) => artistKey !== selectedArtist
              ),
            });
          } else {
            setDiscoveryPreferences({
              selectedArtists: [
                ...discoveryPreferences.selectedArtists,
                artistKey,
              ],
            });
          }
        }}
      >
        <span
          style={{
            display: "grid",
            gridGap: "0.75rem",
            gridTemplateColumns: "1fr auto",
          }}
        >
          <span className="utility-truncate">{artists[artistKey].name}</span>
          <span style={{ opacity: 0.6 }}>
            Appears {artists[artistKey].appearances} time
            {artists[artistKey].appearances === 1 ? "" : "s"}
          </span>
        </span>
      </CheckboxInput>
    </div>
  );
};

const Configuration: React.FunctionComponent<Props & PropsFromStore> = (
  props
) => {
  const {
    artistFilters,
    currentSourcePlaylist,
    discoveryPreferences,
    filteredArtistKeys,
    onChangeSearchArtistsInput,
    onChangeSearchGenreInput,
    searchArtistsInput,
    searchGenreInput,
    setArtistFilters,
    setDiscoveryPreferences,
    setSongFilters,
    setSortPreferences,
    songFilters,
    sortedArtistKeys,
    sortPreferences,
  } = props;

  const doWeDoTheMagicOnTheFrontEnd = true;

  const playlistLink = (
    <a href={currentSourcePlaylist.external_urls.spotify}>
      {currentSourcePlaylist.name}
    </a>
  );

  return (
    <div className="Configuration">
      <h3>Discovery preferences</h3>
      <NumberInput
        id="number-of-songs"
        onChange={({ target: { value } }) =>
          setDiscoveryPreferences({
            numberOfSongs: Math.max(((Number(value) - 1) % 10) + 1, 0),
          })
        }
        value={String(discoveryPreferences.numberOfSongs)}
      >
        Songs from each artist
      </NumberInput>
      <CheckboxInput
        id="include-playlist-songs"
        isChecked={discoveryPreferences.copyPlaylistSongs}
        onChange={() =>
          setDiscoveryPreferences({
            copyPlaylistSongs: !discoveryPreferences.copyPlaylistSongs,
          })
        }
      >
        Copy songs from {playlistLink}
      </CheckboxInput>
      <React.Fragment>
        <label htmlFor="search-artists">Artists</label>
        <TextInput
          inputProps={{
            id: "search-artists",
            onChange: onChangeSearchArtistsInput,
            placeholder: "Search",
            value: searchArtistsInput,
          }}
          style={{ margin: "0.75rem 0" }}
        />
        <CheckboxInput
          id="all-artists"
          isChecked={
            !sortedArtistKeys.find(
              (artist) => !discoveryPreferences.selectedArtists.includes(artist)
            )
          }
          onChange={() => {
            const isChecked = !sortedArtistKeys.find(
              (artist) => !discoveryPreferences.selectedArtists.includes(artist)
            );

            setDiscoveryPreferences({
              selectedArtists: isChecked ? [] : sortedArtistKeys,
            });
          }}
        >
          All artists
        </CheckboxInput>
        <FixedSizeList
          height={300}
          itemCount={filteredArtistKeys.length}
          itemData={props}
          itemKey={(index) => filteredArtistKeys[index]}
          itemSize={40}
          overscanCount={10}
          style={{ marginBottom: "1.5rem" }}
          width="100%"
        >
          {artistRow}
        </FixedSizeList>
      </React.Fragment>
      {doWeDoTheMagicOnTheFrontEnd && (
        <CheckboxInput
          id="include-related-artists"
          isChecked={discoveryPreferences.includeRelatedArtists}
          onChange={() =>
            setDiscoveryPreferences({
              includeRelatedArtists:
                !discoveryPreferences.includeRelatedArtists,
            })
          }
        >
          Include related artists
        </CheckboxInput>
      )}
      {discoveryPreferences.includeRelatedArtists && (
        <CheckboxInput
          id="exclude-playlist-artists"
          isChecked={discoveryPreferences.excludePlaylistArtists}
          onChange={() =>
            setDiscoveryPreferences({
              excludePlaylistArtists:
                !discoveryPreferences.excludePlaylistArtists,
            })
          }
        >
          Exclude artists from {playlistLink}
        </CheckboxInput>
      )}
      <h3>Sort preferences</h3>
      <div className="SelectBox">
        <label htmlFor="sort-by">Sort by</label>
        <div className="SelectBox-select">
          <select
            id="sort-by"
            onChange={(event) =>
              setSortPreferences({
                sortBy: event.target.value as typeof sortPreferences.sortBy,
              })
            }
            value={sortPreferences.sortBy}
          >
            {Object.keys(songFilters.ranges).map((key) => (
              <option key={key} value={key}>
                {key[0].toLocaleUpperCase() + key.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="SelectBox">
        <label htmlFor="sort-direction">Sort direction</label>
        <div className="SelectBox-select">
          <select
            id="sort-direction"
            onChange={(event) =>
              setSortPreferences({
                sortDirection: event.target
                  .value as typeof sortPreferences.sortDirection,
              })
            }
            value={sortPreferences.sortDirection}
          >
            <option value="ascending">Low to high</option>
            <option value="descending">High to low</option>
          </select>
        </div>
      </div>
      <h3>Filter artists</h3>
      {currentSourcePlaylist && "genres" in currentSourcePlaylist && (
        <React.Fragment>
          <label htmlFor="search-genres">Artist Genres</label>
          <TextInput
            inputProps={{
              id: "search-genres",
              onChange: onChangeSearchGenreInput,
              placeholder: "Search",
              value: searchGenreInput,
            }}
            style={{ margin: "0.75rem 0" }}
          />
          <CheckboxInput
            id="all-genres"
            isChecked={
              !currentSourcePlaylist.genres.find(
                (genre) => !artistFilters.selectedGenres.includes(genre)
              )
            }
            onChange={() => {
              const isChecked = !currentSourcePlaylist.genres.find(
                (genre) => !artistFilters.selectedGenres.includes(genre)
              );

              if (isChecked) {
                setArtistFilters({ selectedGenres: [] });
              } else {
                setArtistFilters({
                  selectedGenres: currentSourcePlaylist.genres,
                });
              }
            }}
          >
            All genres
          </CheckboxInput>
          <div
            style={{
              maxHeight: "300px",
              overflowY: "scroll",
              marginBottom: "1.5rem",
            }}
          >
            {currentSourcePlaylist.genres
              .filter((genre) =>
                genre
                  .toLocaleLowerCase()
                  .includes(searchGenreInput.toLocaleLowerCase())
              )
              .map((genre) => {
                const isChecked = artistFilters.selectedGenres.includes(genre);

                return (
                  <CheckboxInput
                    id={genre}
                    key={genre}
                    isChecked={isChecked}
                    onChange={() => {
                      if (isChecked) {
                        setArtistFilters({
                          selectedGenres: artistFilters.selectedGenres.filter(
                            (selectedGenre) => selectedGenre !== genre
                          ),
                        });
                      } else {
                        setArtistFilters({
                          selectedGenres: [
                            ...artistFilters.selectedGenres,
                            genre,
                          ],
                        });
                      }
                    }}
                  >
                    {genre}
                  </CheckboxInput>
                );
              })}
          </div>
        </React.Fragment>
      )}
      <RangeInput
        id="popularity"
        format={(value) => `${value}%`}
        label="Artist popularity"
        max={100}
        min={0}
        onChange={(value) => {
          const halfwayPoint =
            artistFilters.popularity.min +
            (artistFilters.popularity.max - artistFilters.popularity.min) / 2;
          if (
            value <= artistFilters.popularity.min ||
            (value < artistFilters.popularity.max && value < halfwayPoint)
          ) {
            setArtistFilters({
              popularity: {
                min: Math.max(0, value),
                max: artistFilters.popularity.max,
              },
            });
          } else if (
            value >= artistFilters.popularity.max ||
            (value > artistFilters.popularity.min && value >= halfwayPoint)
          ) {
            setArtistFilters({
              popularity: {
                min: artistFilters.popularity.min,
                max: Math.min(100, value),
              },
            });
          }
        }}
        value={artistFilters.popularity}
      />
      <h3>Filter songs</h3>
      <CheckboxInput
        id="exclude-playlist-artists"
        isChecked={discoveryPreferences.excludePlaylistArtists}
        onChange={() =>
          setDiscoveryPreferences({
            excludePlaylistArtists:
              !discoveryPreferences.excludePlaylistArtists,
          })
        }
      >
        Filter out songs from {playlistLink}
      </CheckboxInput>
      {Object.entries(songFilters.ranges).map(([key, value]) => {
        let label = key.replace(/([A-Z])/g, " $1").toLocaleLowerCase();
        label = label[0].toLocaleUpperCase() + label.slice(1);
        return (
          <RangeInput
            id={key}
            key={key}
            format={(value) => `${value}%`}
            label={label}
            max={100}
            min={0}
            onChange={(newValue) => {
              const halfwayPoint = value.min + (value.max - value.min) / 2;
              if (
                (newValue <= value.max && newValue <= halfwayPoint) ||
                newValue <= value.min
              ) {
                setSongFilters({
                  ranges: {
                    ...songFilters.ranges,
                    [key]: {
                      min: Math.max(0, newValue),
                      max: value.max,
                    },
                  },
                });
              } else if (
                (newValue >= value.min && newValue >= halfwayPoint) ||
                newValue >= value.max
              ) {
                setSongFilters({
                  ranges: {
                    ...songFilters.ranges,
                    [key]: {
                      min: value.min,
                      max: Math.min(100, newValue),
                    },
                  },
                });
              }
            }}
            value={value || { min: 0, max: 100 }}
          />
        );
      })}
    </div>
  );
};

function select({ store, setStore }: StoreContext) {
  let currentSourcePlaylist =
    store.sourcePlaylistId && store.playlists[store.sourcePlaylistId];

  if (!currentSourcePlaylist || !("items" in currentSourcePlaylist.tracks)) {
    return null;
  }

  const artistsSimple = currentSourcePlaylist.tracks.items
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

  const filteredArtistKeys = sortedArtistKeys.filter((artistKey) =>
    artists[artistKey].name
      .toLocaleLowerCase()
      .includes(
        store.controlledInputValues.searchArtistsInput.toLocaleLowerCase()
      )
  );

  const setArtistFilters = (
    artistFilters: Partial<Store["playlistPreferences"]["artistFilters"]>
  ) =>
    setStore({
      playlistPreferences: {
        ...store.playlistPreferences,
        artistFilters: {
          ...store.playlistPreferences.artistFilters,
          ...artistFilters,
        },
      },
    });

  const setDiscoveryPreferences = (
    discoveryPreferences: Partial<
      Store["playlistPreferences"]["discoveryPreferences"]
    >
  ) =>
    setStore({
      playlistPreferences: {
        ...store.playlistPreferences,
        discoveryPreferences: {
          ...store.playlistPreferences.discoveryPreferences,
          ...discoveryPreferences,
        },
      },
    });

  const setSongFilters = (
    songFilters: Partial<Store["playlistPreferences"]["songFilters"]>
  ) =>
    setStore({
      playlistPreferences: {
        ...store.playlistPreferences,
        songFilters: {
          ...store.playlistPreferences.songFilters,
          ...songFilters,
        },
      },
    });

  const setSortPreferences = (
    sortPreferences: Partial<Store["playlistPreferences"]["sortPreferences"]>
  ) =>
    setStore({
      playlistPreferences: {
        ...store.playlistPreferences,
        sortPreferences: {
          ...store.playlistPreferences.sortPreferences,
          ...sortPreferences,
        },
      },
    });

  const onChangeSearchArtistsInput: React.ChangeEventHandler<
    HTMLInputElement
  > = (event) =>
    setStore({
      controlledInputValues: {
        ...store.controlledInputValues,
        searchArtistsInput: event.target.value,
      },
    });

  const onChangeSearchGenreInput: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) =>
    setStore({
      controlledInputValues: {
        ...store.controlledInputValues,
        searchGenreInput: event.target.value,
      },
    });

  return {
    artists,
    artistFilters: store.playlistPreferences.artistFilters,
    currentSourcePlaylist,
    discoveryPreferences: store.playlistPreferences.discoveryPreferences,
    filteredArtistKeys,
    onChangeSearchArtistsInput,
    onChangeSearchGenreInput,
    searchArtistsInput: store.controlledInputValues.searchArtistsInput,
    searchGenreInput: store.controlledInputValues.searchGenreInput,
    setArtistFilters,
    setSongFilters,
    setDiscoveryPreferences,
    setSortPreferences,
    songFilters: store.playlistPreferences.songFilters,
    sortedArtistKeys,
    sortPreferences: store.playlistPreferences.sortPreferences,
  };
}

export default React.memo((props: Props) => {
  const selectors = select(React.useContext(storeContext));
  if (!selectors) {
    return null;
  }
  return <Configuration {...selectors} {...props} />;
});

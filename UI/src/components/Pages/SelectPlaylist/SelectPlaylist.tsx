import React from "react";
import { MdClear } from "react-icons/md";

import Library from "../../Library/Library";
import Playlist from "../../Playlist/Playlist";
import TextInput from "../../TextInput/TextInput";

import storeContext, {
  StoreContext,
  defaultStore,
} from "../../../contexts/StoreContext";

import "./SelectPlaylist.css";
import Loader from "../../Loader/Loader";

interface Props {}

type PropsFromStore = ReturnType<typeof select>;

interface State {
  isGeneratingPlaylist: boolean;
}

class SelectPlaylist extends React.Component<Props & PropsFromStore, State> {
  static contextType = storeContext;

  public state = {
    isGeneratingPlaylist: false,
  };

  public render() {
    const {
      clearPlaylist,
      currentSourcePlaylist,
      gotoStep,
      onSearch,
      searchValue,
      selectPlaylist,
      usersPlaylists,
    } = this.props;

    return (
      <div className="SelectPlaylist utility-page-width">
        <div
          style={{
            display: "grid",
            gridGap: "1.5rem",
            gridTemplateColumns: currentSourcePlaylist ? "1fr auto" : "auto",
            padding: "1.5rem",
          }}
        >
          <TextInput
            inputProps={{
              onChange: onSearch,
              placeholder: "Search",
              readOnly: Boolean(currentSourcePlaylist),
              value:
                (currentSourcePlaylist && currentSourcePlaylist.name) ||
                searchValue,
            }}
            rightElement={
              currentSourcePlaylist && (
                <button data-type="icon" onClick={clearPlaylist}>
                  <MdClear size="1rem" />
                </button>
              )
            }
          />
          {currentSourcePlaylist && (
            <button
              disabled={!("items" in currentSourcePlaylist.tracks)}
              onClick={() => gotoStep(1)}
            >
              {"items" in currentSourcePlaylist.tracks ? (
                "Confirm"
              ) : (
                <Loader size="small" />
              )}
            </button>
          )}
        </div>
        {currentSourcePlaylist ? (
          <Playlist playlist={currentSourcePlaylist} />
        ) : (
          <Library
            filterFunction={(playlist) =>
              playlist.name
                .toLowerCase()
                .includes(searchValue.toLocaleLowerCase())
            }
            selectPlaylist={selectPlaylist}
            usersPlaylists={usersPlaylists}
          />
        )}
      </div>
    );
  }
}

function select({ store, setStore }: StoreContext) {
  const clearPlaylist = () =>
    setStore({
      controlledInputValues: {
        ...store.controlledInputValues,
        searchLibraryInput: "",
      },
      playlistPreferences: defaultStore.playlistPreferences,
      sourcePlaylistId: undefined,
    });

  const gotoStep = (step: number) =>
    setStore({
      currentStep: step,
    });

  const selectPlaylist = (playlistId: string) => {
    const selectedPlaylist = store.playlists[playlistId];

    let sortedArtistKeys: string[] = [];
    let artists: { [key: string]: { appearances: number; name: string } } = {};

    if (selectedPlaylist && "items" in selectedPlaylist.tracks) {
      const artistsSimple = selectedPlaylist.tracks.items
        .map(({ track }) => track.artists)
        .flat();

      artists = artistsSimple.reduce((acc, artist) => {
        acc[artist.id] = {
          appearances: (acc[artist.id]?.appearances || 0) + 1,
          name: artist.name,
        };
        return acc;
      }, {} as { [key: string]: { appearances: number; name: string } });

      sortedArtistKeys = Object.keys(artists).sort(
        (a, b) => artists[b].appearances - artists[a].appearances
      );
    }
    setStore({
      playlistPreferences: {
        ...store.playlistPreferences,
        artistFilters: {
          ...store.playlistPreferences.artistFilters,
          selectedGenres:
            selectedPlaylist && "genres" in selectedPlaylist
              ? [selectedPlaylist.genres[0]]
              : [],
        },
        discoveryPreferences: {
          ...store.playlistPreferences.discoveryPreferences,
          selectedArtists: sortedArtistKeys.filter(
            (artistKey) => artists[artistKey].appearances > 1
          ),
        },
      },
      sourcePlaylistId: playlistId,
    });
  };

  const onSearch: React.ChangeEventHandler<HTMLInputElement> = (event) =>
    setStore({
      controlledInputValues: {
        ...store.controlledInputValues,
        searchLibraryInput: event.target.value,
      },
    });

  return {
    clearPlaylist,
    currentSourcePlaylist: store.sourcePlaylistId
      ? store.playlists[store.sourcePlaylistId]
      : undefined,
    gotoStep,
    onSearch,
    selectPlaylist,
    searchValue: store.controlledInputValues.searchLibraryInput,
    usersPlaylists: store.usersPlaylists,
  };
}

export default React.memo((props: Props) => {
  const selectors = select(React.useContext(storeContext));
  return <SelectPlaylist {...selectors} {...props} />;
});

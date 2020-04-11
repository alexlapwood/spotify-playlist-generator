import React from "react";

import Loader from "../../Loader/Loader";
import Playlist from "../../Playlist/Playlist";

import storeContext from "../../../contexts/StoreContext";

import "./PreviewPlaylist.css";

const PreviewPlaylist: React.FunctionComponent = () => {
  const { store } = React.useContext(storeContext);

  const currentDestinationPlaylist = store.destinationPlaylistId
    ? store.playlists[store.destinationPlaylistId]
    : undefined;

  if (!currentDestinationPlaylist) {
    return <Loader style={{ margin: "9.5rem auto" }} />;
  }

  return (
    <div className="SelectPlaylist utility-page-width">
      <Playlist playlist={currentDestinationPlaylist} />
    </div>
  );
};

export default PreviewPlaylist;

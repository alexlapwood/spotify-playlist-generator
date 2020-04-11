import React from "react";
import { MdArrowBack } from "react-icons/md";

import Background from "../Background/Background";
import Header from "../Header/Header";
import SelectPlaylist from "../Pages/SelectPlaylist/SelectPlaylist";
import ConfigurePlaylist from "../Pages/ConfigurePlaylist/ConfigurePlaylist";
import PreviewPlaylist from "../Pages/PreviewPlaylist/PreviewPlaylist";

import StoreContextProvider from "../../contexts/StoreContextProvider";

import "./App.css";
import StoreContext, { defaultStore } from "../../contexts/StoreContext";

const App: React.FunctionComponent = () => (
  <StoreContextProvider>
    <StoreContext.Consumer>
      {({ store, setStore }) => {
        const {
          currentStep,
          destinationPlaylistId,
          playlists,
          sourcePlaylistId,
        } = store;

        const currentDestinationPlaylist = destinationPlaylistId
          ? playlists[destinationPlaylistId]
          : undefined;

        let currentStepMessage = "Step 1: Select a playlist for inspiration";

        if (sourcePlaylistId) {
          currentStepMessage = "Step 2: Confirm your selection";
        }

        if (currentStep === 1) {
          currentStepMessage = "Step 3: Create your new playlist";
        }

        if (currentStep === 2) {
          currentStepMessage = "Creating your playlist";
        }

        if (currentDestinationPlaylist) {
          currentStepMessage = "Playlist created";
        }

        return (
          <div
            className="App"
            style={{
              display: "grid",
              gridTemplateRows: "auto auto 1fr",
            }}
          >
            <Header />
            <div className="CurrentStep">
              {sourcePlaylistId ? (
                <button
                  data-type="icon"
                  key={`go-back-${currentStep}`}
                  onClick={() => {
                    if (currentStep > 0) {
                      setStore({
                        currentStep: currentStep - 1,
                        destinationPlaylistId:
                          currentStep === 2
                            ? undefined
                            : store.destinationPlaylistId,
                      });
                      return;
                    }

                    setStore({
                      controlledInputValues: {
                        ...store.controlledInputValues,
                        searchLibraryInput: "",
                      },
                      playlistPreferences: defaultStore.playlistPreferences,
                      sourcePlaylistId: undefined,
                    });
                  }}
                  style={{ marginRight: "0.75rem" }}
                >
                  <MdArrowBack size="1.5rem" />
                </button>
              ) : (
                <div style={{ height: "3.25rem" }} />
              )}
              <h3>{currentStepMessage}</h3>
            </div>
            <div className="Page">
              <Background />
              {currentStep === 0 && <SelectPlaylist />}
              {currentStep === 1 && <ConfigurePlaylist />}
              {currentStep === 2 && <PreviewPlaylist />}
            </div>
          </div>
        );
      }}
    </StoreContext.Consumer>
  </StoreContextProvider>
);

export default App;

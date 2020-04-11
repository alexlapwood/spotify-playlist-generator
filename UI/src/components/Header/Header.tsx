import React from "react";
import { MdLock } from "react-icons/md";
import axios from "axios";
import { cloneDeep } from "lodash";

import storeContext, {
  defaultStore,
  StoreContext,
} from "../../contexts/StoreContext";

import "./Header.css";

export default class Header extends React.PureComponent {
  static contextType = storeContext;

  public render() {
    return (
      <div className="Header">
        <h1>Playlist generator</h1>
        <button onClick={this.logOut} data-type="link">
          <MdLock size="1rem" style={{ marginRight: "0.5rem" }} />
          Log out
        </button>
      </div>
    );
  }

  private logOut = async () => {
    const { setStore } = this.context as StoreContext;
    try {
      await axios.post("/auth/logout");
    } catch {}

    setStore(cloneDeep(defaultStore));
    window.location.reload();
  };
}

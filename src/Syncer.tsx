import { useEffect, useReducer } from "react";
import { invoke } from "@tauri-apps/api/core";

import type { AppState } from "./types";

type Props = {
  appState: AppState;
};

type SyncStatus = "INIT" | "IDLE" | "SYNCING";

type ReducerState = {
  syncStatus: SyncStatus;
  lastSyncTime: string;
};

type ReducerAction = "START_SYNCING" | "FINISH_SYNCING";

const getCurrentTime = () => new Date().toLocaleTimeString(navigator.language);

const reducer = (state: ReducerState, action: ReducerAction): ReducerState => {
  switch (action) {
    case "START_SYNCING": {
      return {
        ...state,
        syncStatus: "SYNCING",
      };
    }

    case "FINISH_SYNCING": {
      return {
        syncStatus: "IDLE",
        lastSyncTime: getCurrentTime(),
      };
    }

    default: {
      return { ...state };
    }
  }
};

const initialReducerState: ReducerState = {
  syncStatus: "IDLE",
  lastSyncTime: getCurrentTime(),
};

export const Syncer = ({ appState }: Props) => {
  const [state, dispatch] = useReducer(reducer, initialReducerState);

  useEffect(() => {
    dispatch("START_SYNCING");

    invoke("set_ordering", {
      order: JSON.stringify(Object.keys(appState)),
    }).then(() => {
      dispatch("FINISH_SYNCING");
    });
  }, [appState]);

  if (state.syncStatus === "SYNCING") {
    return <span className="syncer">syncing...</span>;
  }

  return <span className="syncer">last synced at {state.lastSyncTime}</span>;
};

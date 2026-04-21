import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import appReducer from "./slices/appSlice";
import dailyResultsReducer from "./slices/dailyResultsSlice";
import foodReducer from "./slices/foodSlice";
import profileReducer from "./slices/profileSlice";
import stepSessionReducer from "./slices/stepSessionSlice";
import trainingProgressReducer from "./slices/trainingProgressSlice";
import waterReducer from "./slices/waterSlice";

const rootReducer = combineReducers({
  app: appReducer,
  dailyResults: dailyResultsReducer,
  water: waterReducer,
  food: foodReducer,
  profile: profileReducer,
  stepSession: stepSessionReducer,
  trainingProgress: trainingProgressReducer,
});

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: [
    "app",
    "dailyResults",
    "water",
    "food",
    "profile",
    "stepSession",
    "trainingProgress",
  ],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


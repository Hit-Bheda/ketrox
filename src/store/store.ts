import { configureStore } from '@reduxjs/toolkit';
import hotelReducer from './slices/hotel-store';


export const store = configureStore({
  reducer: {
    hotel: hotelReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
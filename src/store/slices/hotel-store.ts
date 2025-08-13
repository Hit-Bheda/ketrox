import { createSlice } from '@reduxjs/toolkit';
import { HotelType } from '@/types';


interface hotelSlice {
    hotels: HotelType[];
    selectedHotel: HotelType | null;
    isEditModelOpen: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: hotelSlice = {
    hotels: [],
    selectedHotel: null,
    isEditModelOpen: false,
    isLoading: false,
    error: null,
};

const hotelSlice = createSlice({
    name: 'hotel',
    initialState,
    reducers: {
        setHotels: (state, action) => {
            state.hotels = action.payload;
        },
        setSelectedHotel: (state, action) => {
            console.log("Setting selected hotel:", action.payload);
            state.selectedHotel = action.payload;
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        toggleEditModal: (state, action) => {
            state.isEditModelOpen = action.payload;
        },
    },
})

export const { setHotels, setSelectedHotel, setLoading, setError, toggleEditModal } = hotelSlice.actions;
export default hotelSlice.reducer;
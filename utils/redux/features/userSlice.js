import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user:  null, 
  isLoggedIn: false,
};

export const userSlice = createSlice({
  initialState,
  name: "userSlice",
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setIsUserLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload;
    },
  },
});

export default userSlice.reducer;
export const { setUser, setIsUserLoggedIn } = userSlice.actions;

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const authUrl = "http://localhost:8080/api/v1/auth";

interface User {
  id: number;
  role: number;
  email: string;
  iat?: any;
  exp?: any;
}

const jsonConfig = {
  headers: {
    "Content-Type": "application/json",
  },
  contentType: "application/json",
  withCredentials: true,
};

export interface initialStateInterface {
  user: object;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: initialStateInterface = {
  user: {},
  isAuthenticated: false,
  isLoading: false,
};

export const loadUser = createAsyncThunk<User, void, { rejectValue: any }>(
  "auth/load-user",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${authUrl}/me`, jsonConfig);
      if (response.status === 200) {
        
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userLogin: (state, action: PayloadAction<object>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    userLogout: (state) => {
      state.isAuthenticated = false;
      state.user = {};
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(loadUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = {};
        state.isLoading = false;
      });
  },
});

export const { userLogin, userLogout } = authSlice.actions;
export default authSlice.reducer;

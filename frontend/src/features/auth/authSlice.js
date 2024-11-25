import { createSlice } from "@reduxjs/toolkit"



const authSlice = createSlice({
    name: 'auth',
    initialState: { token: null },
    reducers: {
        setCredentials: (state, action) => {
            const { accessToken } = action.payload
            state.token = accessToken
        },
        logOut: (state, action) => {
            state.toekn = null
        }
    }
})

export const  { setCredentials, logOut } = authSlice.actions

export default authSlice.reducer

export const SelectCurrentToken = (state) => state.auth.token

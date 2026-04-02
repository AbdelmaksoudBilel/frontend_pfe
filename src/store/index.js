import { configureStore } from "@reduxjs/toolkit";
import authReducer  from "./slices/authSlice";
import childReducer from "./slices/childSlice";
import chatReducer  from "./slices/chatSlice";
import uiReducer    from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    auth:  authReducer,
    child: childReducer,
    chat:  chatReducer,
    ui:    uiReducer,
  },
});
export default store;

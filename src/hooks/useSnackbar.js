import { useDispatch } from "react-redux";
import { setSnackbar, clearSnackbar } from "../store/slices/uiSlice";
export function useSnackbar() {
  const dispatch = useDispatch();
  return {
    success: (msg) => dispatch(setSnackbar({ msg, severity: "success" })),
    error:   (msg) => dispatch(setSnackbar({ msg, severity: "error"   })),
    info:    (msg) => dispatch(setSnackbar({ msg, severity: "info"    })),
    clear:   ()    => dispatch(clearSnackbar()),
  };
}

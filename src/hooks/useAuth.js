// src/hooks/useAuth.js — version corrigée
// ─────────────────────────────────────────────────────────────────
// Retourne les actions login/register qui peuvent être .unwrap()
// pour récupérer le payload ou throw l'erreur (Redux Toolkit standard)
// ─────────────────────────────────────────────────────────────────
import { useDispatch, useSelector } from "react-redux";
import {
  loginUser, registerUser, logoutUser, clearError,
  selectAuth,
} from "../store/slices/authSlice";

export function useAuth() {
  const dispatch = useDispatch();
  const auth     = useSelector(selectAuth);

  return {
    ...auth,
    // ✅ Retourne le thunk dispatch — l'appelant peut faire .unwrap()
    // Ex: const data = await login(creds).unwrap()  → data = payload
    //     await login(creds).unwrap()               → throw si erreur
    login:    (credentials) => dispatch(loginUser(credentials)),
    register: (data)        => dispatch(registerUser(data)),
    logout:   ()            => dispatch(logoutUser()),
    clearError: ()          => dispatch(clearError()),
  };
}
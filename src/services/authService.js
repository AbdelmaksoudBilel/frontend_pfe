import api from "./api";
const authService = {
  async login(credentials) {
    const { data } = await api.post("/auth/login", credentials);
    localStorage.setItem("mc_token", data.token);
    localStorage.setItem("mc_user", JSON.stringify(data.user));
    return data;
  },
  async register(userData) {
    const { data } = await api.post("/auth/register", userData);
    return data;
  },
  async getMe() {
    const { data } = await api.get("/auth/me");
    return data;
  },
  logout() {
    localStorage.removeItem("mc_token");
    localStorage.removeItem("mc_user");
  },
  getToken() { return localStorage.getItem("mc_token"); },
  getUser() {
    try { return JSON.parse(localStorage.getItem("mc_user")); }
    catch { return null; }
  },
};
export default authService;

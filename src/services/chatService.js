import api from "./api";
const chatService = {
  async getConversations()           { const { data } = await api.get("/conversations");              return data; },
  async createConversation(childId)  { const { data } = await api.post("/conversations", { childId });return data; },
  async getMessages(convId)          { const { data } = await api.get(`/messages/${convId}`);         return data; },
  async sendMessage(convId, message) { const { data } = await api.post(`/messages/${convId}`, { message }); return data; },
  async sendMedia(convId, formData)  { const { data } = await api.post(`/messages/${convId}/media`, formData, { headers: { "Content-Type": "multipart/form-data" } }); return data; },
  async deleteConversation(id)       { await api.delete(`/conversations/${id}`); return id; },
};
export default chatService;

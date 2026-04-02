// src/services/childService.js
// ─────────────────────────────────────────────────────────────────
// Service enfant — supporte FormData (multipart) pour la photo CNN
// ─────────────────────────────────────────────────────────────────
import api from "./api";

const childService = {

  // Récupérer tous les enfants du parent connecté
  async getAll() {
    const { data } = await api.get("/children");
    return data;
  },

  // Récupérer un enfant par ID
  async getOne(id) {
    const { data } = await api.get(`/children/${id}`);
    return data;
  },

  // Créer un enfant — accepte FormData (avec photo) ou JSON simple
  async create(childData) {
    const isFormData = childData instanceof FormData;
    const { data } = await api.post("/children", childData, {
      headers: isFormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
    });
    return data;
  },

  // Mettre à jour un enfant — supporte FormData pour la photo
  async update(id, patch) {
    const isFormData = patch instanceof FormData;
    const { data } = await api.put(`/children/${id}`, patch, {
      headers: isFormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
    });
    return data;
  },

  // Supprimer un enfant
  async delete(id) {
    await api.delete(`/children/${id}`);
    return id;
  },

  // Lancer la prédiction ML + CNN + RM pour un enfant
  // Appelle GET /children/:id/predict → backend appelle FastAPI Python
  async predict(id) {
    const { data } = await api.get(`/children/${id}/predict`);
    return data;
  },

  // Mettre à jour uniquement la photo de visage
  async updatePhoto(id, photoFile) {
    const fd = new FormData();
    fd.append("facePhoto", photoFile);
    const { data } = await api.put(`/children/${id}/photo`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};

export default childService;
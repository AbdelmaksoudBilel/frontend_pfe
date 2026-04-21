// src/pages/admin/AdminUsers.jsx — avec Edit + Delete + traduction
// Boutons : Modifier (EditDialog) | Approuver | Révoquer | Supprimer
// =============================================================================
import { useState, useEffect, useCallback } from "react";
import {
  Box, Grid, Card, CardContent, Avatar, Chip, IconButton,
  TextField, InputAdornment, MenuItem, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert, Tooltip, Pagination,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from "@mui/material";
import {
  Search as SearchIcon, CheckCircle as ApproveIcon, Cancel as RejectIcon,
  Delete as DeleteIcon, Edit as EditIcon, PeopleAlt as PeopleIcon,
  HourglassEmpty as PendingIcon, VerifiedUser as VerifiedIcon,
  Email as EmailIcon, Phone as PhoneIcon, Save as SaveIcon, Close as CloseIcon,
} from "@mui/icons-material";
import AppText from "../../components/atoms/AppText";
import AppButton from "../../components/atoms/AppButton";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";
import { useTranslation } from "../../hooks/useTranslation";

function EditUserDialog({ user, open, onClose, onSaved }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (user) setForm({ firstName: user.firstName || "", lastName: user.lastName || "", phone: user.phone || "", language: user.language || "fr" });
  }, [user]);
  const handleSave = async () => {
    if (!form.firstName || !form.lastName) { setError(t("adminUsers.requiredFields")); return; }
    setLoading(true); setError("");
    try { await api.put(`/users/${user._id}`, form); onSaved(); onClose(); }
    catch (e) { setError(e.response?.data?.message || "Erreur."); }
    finally { setLoading(false); }
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", fontWeight: 900, fontSize: 14 }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Avatar>
            <AppText variant="h6" sx={{ fontWeight: 800 }}>{t("adminUsers.editDialogTitle").replace("{{name}}", `${user?.firstName} ${user?.lastName}`)}</AppText>
          </Box>
          <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField fullWidth label={t("adminUsers.firstName")} value={form.firstName || ""} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label={t("adminUsers.lastName")} value={form.lastName || ""} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} /></Grid>
          <Grid item xs={12}><TextField fullWidth label={t("adminUsers.email")} value={user?.email || ""} disabled helperText={t("adminUsers.emailDisabled")} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label={t("adminUsers.phone")} value={form.phone || ""} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+216 XX XXX XXX" /></Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth select label={t("adminUsers.language")} value={form.language || "fr"} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}>
              <MenuItem value="fr">{t("adminUsers.french")}</MenuItem>
              <MenuItem value="ar">{t("adminUsers.arabic")}</MenuItem>
              <MenuItem value="en">{t("adminUsers.english")}</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <AppButton variant="outlined" color="secondary" onClick={onClose} disabled={loading}>{t("actions.cancel")}</AppButton>
        <AppButton loading={loading} startIcon={<SaveIcon />} onClick={handleSave}>{t("actions.save")}</AppButton>
      </DialogActions>
    </Dialog>
  );
}

function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading, confirmColor = "primary" }) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>{title}</DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}><AppText variant="body2" color="text.secondary">{message}</AppText></DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <AppButton variant="outlined" color="secondary" onClick={onCancel} disabled={loading}>Annuler</AppButton>
        <AppButton color={confirmColor} onClick={onConfirm} loading={loading}>Confirmer</AppButton>
      </DialogActions>
    </Dialog>
  );
}

function UserRow({ user, onApprove, onReject, onDelete, onEdit, loadingId }) {
  const { t } = useTranslation();
  const isLoading = loadingId === user._id, isApproved = user.isApproved, isVerified = user.isEmailVerified;
  const lang = { fr: "🇫🇷", ar: "🇹🇳", en: "🇬🇧" }[user.language] || "🌐";
  const createdAt = new Date(user.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  return (
    <TableRow hover sx={{ "&:hover": { bgcolor: "background.subtle" } }}>
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ width: 38, height: 38, bgcolor: isApproved ? "primary.main" : "background.blue", color: isApproved ? "white" : "primary.main", fontWeight: 800, fontSize: 14 }}>{user.firstName?.[0]}{user.lastName?.[0]}</Avatar>
          <Box>
            <AppText variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>{user.firstName} {user.lastName}</AppText>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><EmailIcon sx={{ fontSize: 11, color: "text.disabled" }} /><AppText variant="caption" color="text.disabled">{user.email}</AppText></Box>
          </Box>
        </Box>
      </TableCell>
      <TableCell><Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><PhoneIcon sx={{ fontSize: 14, color: "text.disabled" }} /><AppText variant="caption" color="text.secondary">{user.phone || t("adminUsers.dash")}</AppText></Box></TableCell>
      <TableCell><AppText variant="caption">{lang} {user.language?.toUpperCase()}</AppText></TableCell>
      <TableCell><AppText variant="caption" color="text.secondary">{createdAt}</AppText></TableCell>
      <TableCell>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Chip label={isApproved ? t("adminUsers.statusApproved") : t("adminUsers.statusPending")} size="small" icon={isApproved ? <ApproveIcon sx={{ fontSize: "14px !important" }} /> : <PendingIcon sx={{ fontSize: "14px !important" }} />} sx={{ bgcolor: isApproved ? "#E6F7EE" : "#FFF8EE", color: isApproved ? "#48BB78" : "#F5A623", fontWeight: 700, fontSize: "0.7rem" }} />
          <Chip label={isVerified ? t("adminUsers.emailVerified") : t("adminUsers.notVerified")} size="small" sx={{ bgcolor: isVerified ? "background.blue" : "#FFF5F5", color: isVerified ? "primary.dark" : "error.main", fontWeight: 600, fontSize: "0.65rem" }} />
        </Box>
      </TableCell>
      <TableCell align="right">
        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
          <Tooltip title={t("adminUsers.tooltipEdit")}><IconButton size="small" onClick={() => onEdit(user)} disabled={isLoading} sx={{ color: "#48BB78", bgcolor: "#E6F7EE", "&:hover": { bgcolor: "#C6F6D5" } }}><EditIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
          {!isApproved && isVerified && <Tooltip title={t("adminUsers.tooltipApprove")}><IconButton size="small" onClick={() => onApprove(user._id)} disabled={isLoading} sx={{ color: "primary.main", bgcolor: "background.blue", "&:hover": { bgcolor: "#BEE3F8" } }}>{isLoading ? <CircularProgress size={14} /> : <ApproveIcon sx={{ fontSize: 16 }} />}</IconButton></Tooltip>}
          {isApproved && <Tooltip title={t("adminUsers.tooltipRevoke")}><IconButton size="small" onClick={() => onReject(user._id, `${user.firstName} ${user.lastName}`)} disabled={isLoading} sx={{ color: "#F5A623", bgcolor: "#FFF8EE", "&:hover": { bgcolor: "#FEEBCB" } }}>{isLoading ? <CircularProgress size={14} /> : <RejectIcon sx={{ fontSize: 16 }} />}</IconButton></Tooltip>}
          <Tooltip title={t("adminUsers.tooltipDelete")}><IconButton size="small" onClick={() => onDelete(user._id, `${user.firstName} ${user.lastName}`)} disabled={isLoading} sx={{ color: "error.main", bgcolor: "#FFF5F5", "&:hover": { bgcolor: "#FED7D7" } }}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );
}

export default function AdminUsers() {
  const { t, isRTL } = useTranslation();
  const [users, setUsers] = useState([]), [total, setTotal] = useState(0), [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all"), [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true), [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState(""), [success, setSuccess] = useState("");
  const [editUser, setEditUser] = useState(null), [confirm, setConfirm] = useState(null);
  const LIMIT = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (filter === "pending") params.approved = false;
      if (filter === "approved") params.approved = true;
      const { data } = await api.get("/users", { params });
      let list = data.users || [];
      if (search.trim()) { const s = search.toLowerCase(); list = list.filter(u => `${u.firstName} ${u.lastName}`.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)); }
      setUsers(list); setTotal(data.total || 0);
    } catch { setError(t("adminUsers.loadingError")); }
    finally { setLoading(false); }
  }, [page, filter, search]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id) => { setLoadingId(id); try { await api.put(`/users/${id}/approve`); setSuccess(t("adminUsers.approvedOk")); load(); } catch { setError(t("adminUsers.generalError")); } finally { setLoadingId(null); } };
  const handleReject = async (id) => { setLoadingId(id); try { await api.put(`/users/${id}/reject`); setSuccess(t("adminUsers.revokedOk")); setConfirm(null); load(); } catch { setError(t("adminUsers.generalError")); } finally { setLoadingId(null); } };
  const handleDelete = async () => { if (!confirm) return; setLoadingId(confirm.id); try { await api.delete(`/users/${confirm.id}`); setSuccess(`"${confirm.name}" ${t("adminUsers.deletedOk")}`); setConfirm(null); load(); } catch { setError(t("adminUsers.generalError")); } finally { setLoadingId(null); } };

  return (
    <AdminLayout>
      <Box sx={{ mb: 4 }}>
        <AppText variant="h3" sx={{ fontWeight: 900 }}>{t("adminUsers.title")}</AppText>
        <AppText variant="body2" color="text.secondary">{t("adminUsers.subtitle")}</AppText>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[{ label: t("adminUsers.totalParents"), value: total, color: "#3BBDE8", icon: <PeopleIcon /> }, { label: t("adminUsers.pending"), value: users.filter(u => !u.isApproved && u.isEmailVerified).length, color: "#F5A623", icon: <PendingIcon /> }, { label: t("adminUsers.approved"), value: users.filter(u => u.isApproved).length, color: "#48BB78", icon: <VerifiedIcon /> }].map(stat => (
          <Grid item xs={4} key={stat.label}>
            <Card elevation={0} sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: 3 }}>
              <CardContent sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ color: stat.color, fontSize: 22 }}>{stat.icon}</Box>
                <Box><AppText variant="h4" sx={{ fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</AppText><AppText variant="caption" color="text.secondary">{stat.label}</AppText></Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Card elevation={0} sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: 3, mb: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField size="small" placeholder={t("adminUsers.searchPlaceholder")} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} sx={{ flex: 1, minWidth: 200 }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "text.disabled", fontSize: 18 }} /></InputAdornment>, sx: { borderRadius: 3 } }} />
            <TextField select size="small" value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }} sx={{ minWidth: 160 }} InputProps={{ sx: { borderRadius: 3 } }}>
              <MenuItem value="all">{t("adminUsers.allProfiles")}</MenuItem>
              <MenuItem value="pending">{t("adminUsers.pending")}</MenuItem>
              <MenuItem value="approved">{t("adminUsers.approved")}</MenuItem>
            </TextField>
          </Box>
        </CardContent>
      </Card>
      <Card elevation={0} sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: 3 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "background.subtle" }}>
                {[
                  t("adminUsers.colParent"),
                  t("adminUsers.colPhone"),
                  t("adminUsers.colLang"),
                  t("adminUsers.colDate"),
                  t("adminUsers.colStatus"),
                  t("adminUsers.colActions")
                ].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 800, fontSize: "0.78rem", color: "text.secondary", py: 1.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (<TableRow><TableCell colSpan={6} sx={{ textAlign: "center", py: 6 }}><CircularProgress size={32} /></TableCell></TableRow>)
                : users.length === 0 ? (<TableRow><TableCell colSpan={6} sx={{ textAlign: "center", py: 6 }}><AppText variant="body2" color="text.disabled">{t("adminUsers.noUsers")}</AppText></TableCell></TableRow>)
                  : users.map(user => (
                    <UserRow key={user._id} user={user} loadingId={loadingId} onApprove={handleApprove} onEdit={setEditUser}
                      onReject={(id, name) => setConfirm({ type: "reject", id, name })}
                      onDelete={(id, name) => setConfirm({ type: "delete", id, name })} />
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
        {total > LIMIT && <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}><Pagination count={Math.ceil(total / LIMIT)} page={page} onChange={(_, v) => setPage(v)} color="primary" size="small" /></Box>}
      </Card>
      <EditUserDialog user={editUser} open={!!editUser} onClose={() => setEditUser(null)} onSaved={() => { setSuccess(t("adminUsers.savedOk")); load(); }} />
      <ConfirmDialog open={!!confirm} title={confirm?.type === "delete" ? t("adminUsers.deleteTitle") : t("adminUsers.revokeTitle")} message={confirm?.type === "delete" ? t("adminUsers.deleteMsg").replace("{{name}}", confirm?.name) : t("adminUsers.revokeConfirm").replace("{{name}}", confirm?.name)} onConfirm={confirm?.type === "delete" ? handleDelete : () => handleReject(confirm.id)} onCancel={() => setConfirm(null)} loading={!!loadingId} confirmColor={confirm?.type === "delete" ? "error" : "warning"} />
    </AdminLayout>
  );
}
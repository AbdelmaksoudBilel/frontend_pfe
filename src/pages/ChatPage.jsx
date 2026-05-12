// src/pages/ChatPage.jsx — TRADUIT
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Box, Avatar, IconButton, TextField, Tooltip,
  CircularProgress, Drawer, useMediaQuery, useTheme,
  Menu, MenuItem, Divider, InputAdornment, Fade, Chip,
  Alert, Snackbar,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import VideocamIcon from "@mui/icons-material/Videocam";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";

import AppText from "../components/atoms/AppText";
import AppButton from "../components/atoms/AppButton";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "../hooks/useTranslation";
import api from "../services/api";

const SIDEBAR_W = 300;

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr), diff = (Date.now() - d) / 1000;
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}
function formatMsgTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

// ── Message bubble — content NOT translated (real conversation) ───────────────
function MessageBubble({ msg, isLast, onHelpful, user }) {
  const isUser = msg.role === "user";

  const renderMessage = (text) => {
    const parts = text.split(/(\*\(.*?\)\*)/g); // détecte *( ... )*

    return parts.map((part, index) => {
      const isSource = part.startsWith("*(") && part.endsWith(")*");

      if (isSource) {
        const cleanText = part.slice(2, -2); // enlève *( et )*

        return (
          <span
            key={index}
            style={{
              fontSize: "0.75rem",
              color: "#666",
              background: "rgba(0,0,0,0.05)",
              padding: "2px 6px",
              borderRadius: "8px",
              marginLeft: "2px",
              marginRight: "2px",
              whiteSpace: "nowrap"
            }}
          >
            {cleanText}
          </span>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };
  return (
    <Fade in timeout={300}>
      <Box sx={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", mb: 1.5, alignItems: "flex-end", gap: 1 }}>
        {!isUser && (
          <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", flexShrink: 0, mb: 0.5 }}>
            <SmartToyIcon sx={{ fontSize: 18 }} />
          </Avatar>
        )}
        <Box sx={{ maxWidth: { xs: "85%", md: "65%" } }}>
          {msg.fileUrl && msg.fileType && (
            <Box sx={{ mb: 0.5 }}>
              {msg.fileType.startsWith("image")
                ? <Box component="img" src={`${msg.fileUrl}`} sx={{ maxWidth: 220, maxHeight: 180, borderRadius: 3, objectFit: "cover", display: "block" }} />
                : <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.5, bgcolor: "background.subtle", borderRadius: 2, border: "1px solid", borderColor: "divider" }}><VideocamIcon sx={{ color: "primary.main" }} /><AppText variant="caption" sx={{ color: "text.primary" }}>Vidéo envoyée</AppText></Box>
              }
            </Box>
          )}
          {msg.message && (
            <Box sx={{ px: 2, py: 1.2, bgcolor: isUser ? "primary.main" : "white", borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px", boxShadow: isUser ? "0 2px 12px rgba(59,189,232,0.3)" : "0 2px 8px rgba(0,0,0,0.06)", border: isUser ? "none" : "1px solid", borderColor: "divider" }}>
              <AppText variant="body2" sx={{ color: isUser ? "white" : "text.primary", lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {renderMessage(msg.message)}
              </AppText>
            </Box>
          )}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: isUser ? "flex-end" : "flex-start", gap: 0.5, mt: 0.4, px: 0.5 }}>
            <AppText variant="caption" sx={{ color: "text.disabled", fontSize: "0.68rem" }}>{formatMsgTime(msg.sentAt || msg.createdAt)}</AppText>
            {!isUser && (
              <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                <ThumbUpIcon color={msg.helpful === true ? "primary" : "disabled"} sx={{ fontSize: 20, cursor: "pointer", mr: 1, ml: 1 }} onClick={() => onHelpful(msg?.msgId, true)} />
                <ThumbDownAltIcon color={msg.helpful === false ? "error" : "disabled"} sx={{ fontSize: 20, cursor: "pointer" }} onClick={() => onHelpful(msg?.msgId, false)} />
              </Box>
            )}
            {isUser && isLast && <DoneAllIcon sx={{ fontSize: 14, color: "primary.main" }} />}
          </Box>
        </Box>
        {isUser && (
          <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", flexShrink: 0, mb: 0.5, fontSize: 14, fontWeight: 800 }}>
            {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
          </Avatar>
        )}
      </Box>
    </Fade>
  );
}

function TypingIndicator() {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1, mb: 1.5 }}>
      <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", flexShrink: 0 }}><SmartToyIcon sx={{ fontSize: 18 }} /></Avatar>
      <Box sx={{ px: 2, py: 1.5, bgcolor: "white", borderRadius: "18px 18px 18px 4px", border: "1px solid", borderColor: "divider", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 0.6 }}>
        {[0, 1, 2].map(i => (
          <Box key={i} sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "primary.main", animation: "bounce 1.2s ease infinite", animationDelay: `${i * 0.2}s`, "@keyframes bounce": { "0%,80%,100%": { transform: "translateY(0)" }, "40%": { transform: "translateY(-8px)" } } }} />
        ))}
      </Box>
    </Box>
  );
}

function ConvItem({ conv, active, onClick, onDelete, t }) {
  const [anchor, setAnchor] = useState(null);
  return (
    <Box sx={{ px: 1.5, py: 1.2, mx: 1, borderRadius: 2, cursor: "pointer", bgcolor: active ? "background.blue" : "transparent", border: "1px solid", borderColor: active ? "primary.light" : "transparent", transition: "all 0.15s", "&:hover": { bgcolor: active ? "background.blue" : "background.subtle" }, display: "flex", alignItems: "center", gap: 1.2, position: "relative" }} onClick={onClick}>
      <Box sx={{ width: 38, height: 38, borderRadius: 2, flexShrink: 0, bgcolor: active ? "primary.main" : "background.blue", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <SmartToyIcon sx={{ fontSize: 20, color: active ? "white" : "primary.main" }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <AppText variant="body2" sx={{ fontWeight: 700, color: "text.primary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conv.name || t("chat.newConversation")}</AppText>
        <AppText variant="caption" sx={{ color: "text.disabled", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{conv.resume || "—"}</AppText>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5, flexShrink: 0 }}>
        <AppText variant="caption" sx={{ color: "text.disabled", fontSize: "0.65rem" }}>{formatTime(conv.updatedAt)}</AppText>
        <IconButton size="small" onClick={e => { e.stopPropagation(); setAnchor(e.currentTarget); }} sx={{ p: 0.3, opacity: 0.5, "&:hover": { opacity: 1, color: "error.main" } }}>
          <MoreVertIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => { onDelete(conv._id); setAnchor(null); }} sx={{ color: "error.main", gap: 1, fontSize: "0.9rem" }}>
          <DeleteOutlineIcon fontSize="small" /> {t("chat.deleteConv")}
        </MenuItem>
      </Menu>
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════════
export default function ChatPage() {
  const { convId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user, logout } = useAuth();
  const { t, isRTL } = useTranslation();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [search, setSearch] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [profileMenu, setProfileMenu] = useState(null);
  const [children, setChildren] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [errorVideo, setErrorVideo] = useState("");
  const [openVideo, setOpenVideo] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    api.get("/conversations").then(r => {
      const convs = r.data || [];
      setConversations(convs);
      if (convId) { const f = convs.find(c => c._id === convId); if (f) openConv(f); }
      else if (convs.length > 0 && !isMobile) openConv(convs[0]);
    }).catch(() => { });
  }, []);

  useEffect(() => {
    const childId = searchParams.get("childId");
    if (childId) createConv(childId);
  }, [searchParams]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  useEffect(() => {
    api.get("/children").then(r => { if (r.data?.length > 0) setChildren(r.data); }).catch(() => { });
  }, []);

  const openConv = useCallback(async (conv) => {
    setActiveConv(conv);
    setMessages([]);
    setLoadingMsgs(true);
    if (isMobile) setSidebarOpen(false);
    try {
      const r = await api.get(`/messages/${conv._id}`);
      const formatted = [];
      r.data.forEach(m => {
        if (m.role === "user") formatted.push({ _id: m._id, role: "user", message: m.message, sentAt: m.sentAt || m.createdAt, fileUrl: m.fileUrl, fileType: m.fileType });
        if (m.response?.reponse) formatted.push({ _id: m._id, role: "assistant", message: m.response.reponse, sentAt: m.response.generatedAt, helpful: m.response.helpful, msgId: m.response.messageId });
      });
      setMessages(formatted);
    } catch (err) { console.error(err); }
    finally { setLoadingMsgs(false); }
    navigate(`/chat/${conv._id}`, { replace: true });
  }, [isMobile, navigate]);

  const createConv = async (childId) => {
    try {
      setAnchorEl(null);
      const r = await api.post("/conversations", { childId });
      setConversations(prev => [r.data, ...prev]);
      openConv(r.data);
    } catch { }
  };

  const handleNewConv = () => {
    api.get("/children").then(r => { if (r.data?.length > 0) createConv(r.data[0]._id); }).catch(() => { });
  };

  const deleteConv = async (id) => {
    await api.delete(`/conversations/${id}`).catch(() => { });
    setConversations(prev => prev.filter(c => c._id !== id));
    if (activeConv?._id === id) { setActiveConv(null); setMessages([]); navigate("/chat", { replace: true }); }
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachedFile) || !activeConv || sending) return;
    const text = input.trim(), file = attachedFile;
    setInput(""); setAttachedFile(null); setSending(true);
    const temp = { _id: `t${Date.now()}`, role: "user", message: text, sentAt: new Date().toISOString() };
    setMessages(prev => [...prev, temp]);
    setIsTyping(true);
    try {
      let r;
      if (file) {
        const fd = new FormData();
        if (text) fd.append("message", text);
        fd.append("media", file);
        r = await api.post(`/messages/${activeConv._id}/media`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        r = await api.post(`/messages/${activeConv._id}`, { message: text });
      }
      setMessages(prev => {
        const f = prev.filter(m => m._id !== temp._id);
        const n = [...f];
        if (r.data?.message) n.push({ _id: r.data.message._id, role: "user", message: r.data.message.message, sentAt: r.data.message.sentAt || r.data.message.createdAt, fileUrl: r.data.message.fileUrl, fileType: r.data.message.fileType });
        if (r.data?.response) n.push(r.data.response);
        return n;
      });
      setConversations(prev => prev.map(c => c._id === activeConv._id ? { ...c, resume: text.substring(0, 50), updatedAt: new Date() } : c));
    } catch {
      setMessages(prev => prev.filter(m => m._id !== temp._id));
    } finally {
      setSending(false); setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 15) { setErrorVideo("La vidéo ne doit pas dépasser 15 secondes"); setOpenVideo(true); return; }
        setAttachedFile(file);
      };
      video.src = URL.createObjectURL(file);
    } else { setAttachedFile(file); }
    e.target.value = "";
  };

  const handleHelpful = async (msgId, isHelpful) => {
    try {
      await api.put(`/responses/${msgId}/feedback`, { helpful: isHelpful, review: null });
      setMessages(prev => prev.map(m => m?.msgId === msgId ? { ...m, helpful: isHelpful } : m));
    } catch { }
  };

  const filteredConvs = conversations.filter(c => !search || (c.name || "").toLowerCase().includes(search.toLowerCase()));

  // ── SIDEBAR ───────────────────────────────────────────────────────────────
  const sidebar = (
    <Box sx={{ width: SIDEBAR_W, height: "100%", display: "flex", flexDirection: "column", bgcolor: "white", borderRight: "1px solid", borderColor: "divider" }} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, cursor: "pointer" }} onClick={e => setProfileMenu(e.currentTarget)}>
          <Avatar sx={{ width: 42, height: 42, bgcolor: "primary.main", fontWeight: 800, fontSize: 16 }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <AppText variant="body2" sx={{ fontWeight: 700, color: "text.primary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.firstName} {user?.lastName}</AppText>
            <AppText variant="caption" color="text.disabled">{t("chat.sidebar.parentLabel")}</AppText>
          </Box>
          <IconButton size="small"><MoreVertIcon sx={{ fontSize: 18 }} /></IconButton>
        </Box>
        <AppButton fullWidth size="small" startIcon={<AddIcon />} onClick={e => setAnchorEl(e.currentTarget)}>
          {t("chat.newConversation")}
        </AppButton>
        <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}>
          {children.map(c => (
            <Box key={c._id}>
              <MenuItem onClick={() => createConv(c._id)}>
                <Avatar sx={{ mr: 2 }} /> {c.firstName} {c.lastName}
              </MenuItem>
              <Divider />
            </Box>
          ))}
        </Menu>
      </Box>

      {/* Search */}
      <Box sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
        <TextField fullWidth size="small" placeholder={t("chat.searchConv")} value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: "text.disabled" }} /></InputAdornment>,
            endAdornment: search && (<InputAdornment position="end"><IconButton size="small" onClick={() => setSearch("")}><CloseIcon sx={{ fontSize: 16 }} /></IconButton></InputAdornment>),
            sx: { borderRadius: 3 },
          }} />
      </Box>

      {/* Label */}
      <Box sx={{ px: 2, py: 1 }}>
        <AppText variant="caption" sx={{ color: "text.disabled", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
          {t("chat.sidebar.convCount")} ({filteredConvs.length})
        </AppText>
      </Box>

      {/* Conversations */}
      <Box sx={{ flex: 1, overflowY: "auto", py: 0.5, "&::-webkit-scrollbar": { width: 4 }, "&::-webkit-scrollbar-thumb": { bgcolor: "divider", borderRadius: 4 } }}>
        {filteredConvs.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <SmartToyIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
            <AppText variant="body2" color="text.disabled">{search ? t("actions.noData") : t("chat.noConversation")}</AppText>
            {!search && <AppButton size="small" sx={{ mt: 1.5 }} onClick={e => setAnchorEl(e.currentTarget)}>{t("actions.create")}</AppButton>}
          </Box>
        ) : filteredConvs.map(conv => (
          <ConvItem key={conv._id} conv={conv} active={activeConv?._id === conv._id}
            onClick={() => openConv(conv)} onDelete={deleteConv} t={t} />
        ))}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          {[
            { icon: <PersonIcon fontSize="small" />, tip: t("nav.profile"), action: () => navigate("/profile") },
            { icon: <ChildCareIcon fontSize="small" />, tip: t("nav.addChild"), action: () => navigate("/child-wizard") },
            { icon: <LogoutIcon fontSize="small" />, tip: t("nav.logout"), action: () => { logout(); navigate("/login"); }, color: "error.main" },
          ].map((b, i) => (
            <Tooltip key={i} title={b.tip}>
              <IconButton size="small" onClick={b.action} sx={{ flex: 1, borderRadius: 2, py: 1, "&:hover": { bgcolor: b.color ? "#FFF5F5" : "background.blue", color: b.color || "primary.main" } }}>
                {b.icon}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      </Box>
    </Box>
  );

  // ── CHAT ZONE ─────────────────────────────────────────────────────────────
  const chatZone = (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", bgcolor: "background.default", overflow: "hidden" }} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <Box sx={{ px: 2.5, py: 1.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1.5, bgcolor: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        {isMobile && (<IconButton size="small" onClick={() => setSidebarOpen(true)}><MenuIcon /></IconButton>)}
        <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main" }}><SmartToyIcon sx={{ fontSize: 18 }} /></Avatar>
        <Box sx={{ flex: 1 }}>
          <AppText variant="body2" sx={{ fontWeight: 800 }}>{activeConv?.name || t("chat.title")}</AppText>
        </Box>
      </Box>

      {/* Messages */}
      <Box sx={{ flex: 1, overflowY: "auto", px: { xs: 2, md: 3 }, py: 2, bgcolor: "#F8FBFF", "&::-webkit-scrollbar": { width: 5 }, "&::-webkit-scrollbar-thumb": { bgcolor: "divider", borderRadius: 4 } }}>
        {!activeConv && (
          <Box sx={{ textAlign: "center", mt: { xs: 6, md: 10 } }}>
            <AppText variant="h4" sx={{ fontWeight: 800, mb: 2 }}>{t("chat.greet")} {user?.firstName}, {t("chat.greetMsg")}</AppText>
            <AppText variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: "auto" }}>{t("chat.selectOrCreate")}</AppText>
            <AppButton startIcon={<AddIcon />} onClick={e => setAnchorEl(e.currentTarget)}>{t("chat.newConversation")}</AppButton>
          </Box>
        )}
        {activeConv && loadingMsgs && (<Box sx={{ textAlign: "center", py: 6 }}><CircularProgress size={36} sx={{ color: "primary.main" }} /></Box>)}
        {activeConv && !loadingMsgs && messages.length === 0 && (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <SmartToyIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
            <AppText variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{t("chat.emptyConv")}</AppText>
            <AppText variant="body2" color="text.secondary" sx={{ mb: 3 }}>{t("chat.emptyConvMsg")}</AppText>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center", maxWidth: 500, mx: "auto" }}>
              {["q1", "q2", "q3", "q4"].map(k => (
                <Chip key={k} label={t(`chat.suggestions.${k}`)} size="small" onClick={() => setInput(t(`chat.suggestions.${k}`))}
                  sx={{ cursor: "pointer", bgcolor: "background.blue", color: "primary.dark", fontWeight: 600, "&:hover": { bgcolor: "primary.main", color: "white" } }} />
              ))}
            </Box>
          </Box>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={msg._id || i} msg={msg} isLast={i === messages.length - 1}
            onHelpful={handleHelpful} user={user} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </Box>

      {/* Attached file preview */}
      {attachedFile && (
        <Box sx={{ px: 2.5, py: 1, bgcolor: "white", borderTop: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1, bgcolor: "background.blue", borderRadius: 2, flex: 1 }}>
            {attachedFile.type.startsWith("image") ? <ImageIcon sx={{ color: "primary.main", fontSize: 18 }} /> : <VideocamIcon sx={{ color: "primary.main", fontSize: 18 }} />}
            <AppText variant="caption" sx={{ color: "primary.dark", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{attachedFile.name}</AppText>
            <AppText variant="caption" color="text.disabled">{(attachedFile.size / 1024).toFixed(0)} KB</AppText>
          </Box>
          <IconButton size="small" onClick={() => setAttachedFile(null)}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
        </Box>
      )}

      {/* Input */}
      <Box sx={{ px: 2, py: 1.5, bgcolor: "white", borderTop: "1px solid", borderColor: "divider", boxShadow: "0 -2px 12px rgba(0,0,0,0.04)" }}>
        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
          <Tooltip title={t("chat.attachFile")}>
            <IconButton size="small" onClick={() => fileInputRef.current?.click()} disabled={!activeConv || sending}
              sx={{ mb: 0.5, color: "text.secondary", "&:hover": { color: "primary.main", bgcolor: "background.blue" } }}>
              <AttachFileIcon />
            </IconButton>
          </Tooltip>
          <input ref={fileInputRef} type="file" accept="image/*,video/*" style={{ display: "none" }} onChange={handleFileChange} />
          <Snackbar open={openVideo} autoHideDuration={5000} onClose={() => setOpenVideo(false)} anchorOrigin={{ vertical: "bottom", horizontal: "left" }}>
            <Alert onClose={() => setOpenVideo(false)} severity="error" variant="filled" sx={{ width: "100%" }}>{errorVideo}</Alert>
          </Snackbar>
          <TextField inputRef={inputRef} fullWidth multiline maxRows={5}
            placeholder={activeConv ? t("chat.placeholder") : t("chat.placeholderDisabled")}
            value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
            disabled={!activeConv || sending}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4, bgcolor: "background.subtle", "& fieldset": { borderColor: "transparent" }, "&:hover fieldset": { borderColor: "primary.light" }, "&.Mui-focused fieldset": { borderColor: "primary.main" } }, "& textarea": { fontSize: "0.9rem", lineHeight: 1.6 } }}
          />
          <Tooltip title={t("actions.send")}>
            <span>
              <IconButton onClick={handleSend} disabled={(!input.trim() && !attachedFile) || !activeConv || sending}
                sx={{ mb: 0.5, bgcolor: (input.trim() || attachedFile) && activeConv ? "primary.main" : "background.subtle", color: (input.trim() || attachedFile) && activeConv ? "white" : "text.disabled", "&:hover": { bgcolor: "primary.dark" }, transition: "all 0.2s" }}>
                {sending ? <CircularProgress size={20} sx={{ color: "white" }} /> : <SendIcon sx={{ fontSize: 20 }} />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
        <AppText variant="caption" color="text.disabled" sx={{ display: "block", textAlign: "center", mt: 0.8, fontSize: "0.65rem" }}>
          {t("chat.hintEnter")}
        </AppText>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {isMobile ? (
        <Drawer anchor="left" open={sidebarOpen} onClose={() => setSidebarOpen(false)} PaperProps={{ sx: { width: SIDEBAR_W } }}>{sidebar}</Drawer>
      ) : (
        <Box sx={{ width: SIDEBAR_W, flexShrink: 0, height: "100vh" }}>{sidebar}</Box>
      )}
      {chatZone}
      <Menu anchorEl={profileMenu} open={!!profileMenu} onClose={() => setProfileMenu(null)}>
        <MenuItem onClick={() => { navigate("/profile"); setProfileMenu(null); }}><PersonIcon fontSize="small" sx={{ mr: 1 }} /> {t("nav.profile")}</MenuItem>
        <MenuItem onClick={() => { navigate("/child-wizard"); setProfileMenu(null); }}><ChildCareIcon fontSize="small" sx={{ mr: 1 }} /> {t("nav.addChild")}</MenuItem>
        <Divider />
        <MenuItem onClick={() => { logout(); navigate("/login"); }} sx={{ color: "error.main" }}><LogoutIcon fontSize="small" sx={{ mr: 1 }} /> {t("nav.logout")}</MenuItem>
      </Menu>
    </Box>
  );
}
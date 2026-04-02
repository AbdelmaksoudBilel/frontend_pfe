import { Box } from "@mui/material";
import AppText from "../atoms/AppText";
export default function ChatBubble({ role, message }) {
  const isUser = role === "user";
  return (
    <Box sx={{ mb: 1.5 }}>
      <AppText variant="caption" sx={{ mb: 0.5, display: "block", color: "text.disabled" }}>
        {isUser ? "Vous" : "Assistant IA"}
      </AppText>
      <Box sx={{
        display: "inline-block", maxWidth: "88%",
        bgcolor: isUser ? "background.subtle" : "background.blue",
        border: isUser ? "1px solid #E2ECF5" : "1px solid #d0edf9",
        borderRadius: isUser ? "12px 12px 12px 3px" : "12px 12px 3px 12px",
        px: 1.8, py: 1.2,
      }}>
        <AppText variant="body2" color="text.primary" sx={{ lineHeight: 1.6 }}>{message}</AppText>
      </Box>
    </Box>
  );
}

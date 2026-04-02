import { useDispatch, useSelector } from "react-redux";
import { fetchConversations, sendMessage, fetchMessages, setActiveConversation, addLocalMessage } from "../store/slices/chatSlice";
import { selectConversations, selectMessages, selectSending, selectActiveConv } from "../store/slices/chatSlice";
export function useChat() {
  const dispatch = useDispatch();
  return {
    conversations:     useSelector(selectConversations),
    messages:          useSelector(selectMessages),
    sending:           useSelector(selectSending),
    activeConv:        useSelector(selectActiveConv),
    loadConversations: ()            => dispatch(fetchConversations()),
    loadMessages:      (convId)      => dispatch(fetchMessages(convId)),
    send:              (convId, msg) => dispatch(sendMessage({ convId, message: msg })),
    setActive:         (conv)        => dispatch(setActiveConversation(conv)),
    addLocal:          (msg)         => dispatch(addLocalMessage(msg)),
  };
}

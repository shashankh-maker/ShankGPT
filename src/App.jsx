import { useState } from "react";
import Main from "./components/Main/Main";
import Sidebar from "./components/Sidebar/Sidebar";

const App = () => {
  const [chats, setChats] = useState([]);
  const [activeChatIndex, setActiveChatIndex] = useState(null);

  const handleNewChat = () => {
    setActiveChatIndex(null);
  };

  const loadChat = (index) => {
    setActiveChatIndex(index);
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar
        chats={chats}
        onNewChat={handleNewChat}
        onLoadChat={loadChat}
      />
      <Main
        chats={chats}
        setChats={setChats}
        activeChatIndex={activeChatIndex}
        setActiveChatIndex={setActiveChatIndex}
      />
    </div>
  );
};

export default App;

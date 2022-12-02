import { useEffect, useRef, useState } from "react";
import {
  ActionIcon,
  Group,
  Paper,
  ScrollArea,
  Stack,
} from "@mantine/core";
import { useInView } from "react-intersection-observer";
import { ChevronDown } from "tabler-icons-react";
import { auth } from "../lib/firebase";
import ChatBox from "./ChatBox";
import ChatMessage from "./ChatMessage";

import Loading from "./Loading";
import NavBar from "./NavBar";
import QuotaReached from "./QuotaReached";
import messages from "../data/messages.json";
import SocketIO from "socket.io-client";

const socket = SocketIO("http://localhost:3001", {
  transports: ["websocket", "polling", "flashsocket"],
});

const ChatRoom = () => {
  const [mes, setMes] = useState<any[]>([]);
  const [isWriting, setIsWriting] = useState<Boolean>(false);
  let mess: any[] = [];
  const [loading, setloading] = useState(true);
  const [quota, setQuota] = useState(false);
  const dummy = useRef<HTMLDivElement>(null);
  const [id, setId] = useState("");
  var msgId = 0;
  useEffect(() => {
    if (auth.currentUser) {
      getMessages();
    }
    socket.on("writing", (data: any, uid : any) => {
      setIsWriting(data);
    });
  }, []);

  const receiveMessage = (data: any, uid: any) => {
    //send message to backend
    var message = {
      id: msgId++,
      text: data,
      uid: uid,
      createdAt: "doc.data().createdAt",
      deleted: false,
      repliedTo: " doc.data().repliedTo",
      ruid: 1,
      rtext: "sd",
    };
    setMes((oldmess) => [...oldmess, message]);
  };

  const getMessages = () => {
    //fetch from backend
    mess = [];
    messages.reverse().map((doc) => {
      return mess.push({
        id: doc.id,
        text: doc.text,
        uid: doc.uid,
        createdAt: doc.createdAt,
        deleted: doc.deleted,
        repliedTo: doc.repliedTo,
        ruid: doc.ruid,
        rtext: doc.rtext,
      });
    });
    setMes(mess);
    setloading(false);
  };

  function goBot() {
    dummy.current?.scrollIntoView({ behavior: "smooth" });
    setId("");
  }
  const [ruid, setRuid] = useState("");

  const { ref, inView } = useInView({
    /* Optional options */
    delay: 600,
    threshold: 1,
  });
  return (
    <>
      {loading ? (
        <Loading />
      ) : quota ? (
        <QuotaReached />
      ) : (
        <>
          <NavBar isWriting={isWriting} uid={auth.currentUser?.uid} />
          <Stack sx={{ height: "84vh" }} p={0}>
            <ScrollArea p="xs" scrollbarSize={1} sx={{ height: "84vh" }}>
              <Stack>
                <Group hidden={inView} position="center" pt="xs">
                  <Paper
                    shadow="md"
                    radius="xl"
                    withBorder
                    p={0}
                    sx={{ position: "absolute", top: "95%" }}
                  >
                    <ActionIcon color="violet" radius="xl" onClick={goBot}>
                      <ChevronDown />
                    </ActionIcon>
                  </Paper>
                </Group>

                {mes.map((msg, id) => {
                  return (
                    <ChatMessage
                      key={id}
                      message={msg}
                      replyMessage={() => {}}
                    />
                  );
                })}
              </Stack>
              <div ref={ref}></div>
              <div ref={dummy}></div>
            </ScrollArea>
          </Stack>
          <ChatBox
            receiveMessage={receiveMessage}
            socket={socket}
            fn={goBot}
            id={id}
            ruid={ruid}
          />
        </>
      )}
    </>
  );
};
export default ChatRoom;

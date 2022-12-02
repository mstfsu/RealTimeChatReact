import { ActionIcon, Group, Stack, TextInput } from "@mantine/core";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { MoodHappy, Send } from "tabler-icons-react";
import { auth } from "../lib/firebase";

const ChatBox = (props: any) => {
  const [value, setValue] = useState("");
  const user = auth.currentUser;
  let mess = "";

  useEffect(() => {
    props.socket.on("connect", () => {
      props.socket.emit("user", user);
    });

    props.socket.on("send_message", (message: any, uid: any) => {
      props.receiveMessage(message, uid);
    });
  }, []);

  const handleKeyUp = (value: any) => {
    var isWriting = true;
    if (value === "") {
      isWriting = false;
    }
    props.socket.emit("writing", isWriting);
  };

  const sendMessage = async () => {
    if (user) {
      if (value.length > 100) {
        toast.error("Must not exceed 100 characters");
        setValue("");
      } else {
        props.fn();
        mess = value;
        setValue("");
        props.socket.emit("send_message", mess, auth.currentUser?.uid);
        props.receiveMessage(mess, auth.currentUser?.uid);
        props.socket.emit("writing", false);
      }
    }
  };

  return (
    <>
      <Stack sx={{ height: "8vh" }} justify="center" p={0}>
        <Group position="right" p="xs">
          <TextInput
            value={value}
            onKeyUp={(event) => handleKeyUp(event.currentTarget.value)}
            onChange={(event) => setValue(event.currentTarget.value)}
            sx={{ flexGrow: 1 }}
            placeholder="Say something nice . . . "
            rightSection={
              <ActionIcon
                onClick={() =>
                  toast("Display only hehe", {
                    icon: "😁",
                  })
                }
              >
                <MoodHappy />
              </ActionIcon>
            }
            // onKeyDown={
            //   !/\S/.test(value)
            //     ? undefined
            //     : value.length < 2
            //     ? undefined
            //     : getHotkeyHandler([["Enter", sendMessage]])
            // }
          />
          <ActionIcon
            onClick={() => sendMessage()}
            variant="hover"
            size="lg"
            disabled={
              !/\S/.test(value) ? true : value.length < 2 ? true : false
            }
          >
            <Send />
          </ActionIcon>
        </Group>
      </Stack>
    </>
  );
};

export default ChatBox;

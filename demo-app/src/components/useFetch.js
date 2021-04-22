import { useState, useEffect, useContext, useCallback } from "react";
import { SocketContext } from "../context/socket";

// const ENDPOINT = "https://ab8356b9f58284b409aa8b26f51619ce-bd9822f4345325cc.elb.us-west-1.amazonaws.com/";

export const useFetch = () => {
  // const socket = useContext(SocketContext);

  const [posts, setPosts] = useState([]);

  // const handleData = useCallback(() => {
  //   fetch(
  //     "https://ab8356b9f58284b409aa8b26f51619ce-bd9822f4345325cc.elb.us-west-1.amazonaws.com/api/posts"

  //     // window.location.protocol + "//" + window.location.host + "/api/posts"
  //   )
  //     .then((res) => res.json())
  //     .then((res) => {
  //       setPosts(res);
  //     });
  // }, []);

  // useEffect(() => {
  //   handleData();
  //   return () => {};
  // }, []);

  // useEffect(() => {
  //   fetch(
  //     "https://ab8356b9f58284b409aa8b26f51619ce-bd9822f4345325cc.elb.us-west-1.amazonaws.com/"

  //     // window.location.protocol + "//" + window.location.host + "/api/posts"
  //   )
  //     .then((res) => res.json())
  //     .then((res) => {
  //       console.log(res);
  //       setPosts(res);
  //       console.log("data");
  //     });
  // });

  return posts;
};

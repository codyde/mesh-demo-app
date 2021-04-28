import React, { useState, useEffect, useContext, useCallback } from "react";
import { Card, Message, Grid, Segment, Form, Button } from "semantic-ui-react";
import { useFetch } from "./useFetch";
import { SocketContext } from "../context/socket";
import io from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Radium, { StyleRoot } from "radium";

export const Posts = () => {
  // const ENDPOINT = "http://localhost:5000";
  const ENDPOINT = window.location.protocol + "//" + window.location.host;
  const [block, setBlock] = useState([]);
  const [auth, setAuth] = useState("");

  const err = () =>
    toast.error("Submission Error", {
      position: "bottom-center",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

  function CheckError(response) {
    console.log(response);
    if (response.status >= 200 && response.status <= 299) {
      return response.json();
    } else {
      err();
      throw Error(response.statusText);
    }
  }

  function submitPost(data) {
    const body = { text: message.text, title: message.title };
    const headers = { "Content-Type": "application/json" };

    axios
      .post(ENDPOINT + "/api/posts", body, { headers })
      .then((response) => {
        if (response.status >= 200 && response.status <= 299) {
          return response;
        } else {
          err();
          throw Error(response.statusText);
        }
      })
      .then((res) => {
        console.log(res);
        getPosts();
      })
      .catch((error) => {
        err();
        console.log(error);
      });
  }

  const getPosts = useCallback(() => {
    fetch(ENDPOINT + "/api/posts")
      .then((res) => res.json())
      .then((res) => {
        setBlock(res);
      });
  }, []);

  function deletePosts() {
    axios
      .delete(ENDPOINT + "/api/posts")
      .then((response) => {
        if (response.status >= 200 && response.status <= 299) {
          return response;
        } else {
          err();
          throw Error(response.statusText);
        }
      })
      .then((res) => {
        setBlock([]);
      })
      .catch((error) => {
        console.log(error);
        err();
      });
  }

  function getJWT() {
    const jwt = localStorage.getItem("jwtToken");
    setAuth("Bearer " + jwt);
    console.log(auth);
    return auth;
  }

  useEffect(() => {
    getPosts();
    getJWT();
  }, []);

  useEffect(() => {
    // const socket = useContext(SocketContext);
    const socket = io(ENDPOINT);
    socket.on("my event", (data) => {
      console.log("socket change");
      setBlock(data);
    });
  }, [setBlock.length]);

  const data = useFetch();

  const [message, setMessage] = useState({
    text: "",
    title: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setMessage((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  return (
    <Segment vertical>
      <Grid celled="internally" columns="equal" stackable>
        <Grid.Column>
          <Message>
            <Form>
              <Form.Input
                fluid
                label="Message Title"
                id="title"
                placeholder="Title Text"
                value={message.title}
                onChange={handleChange}
              />
              <Form.Input
                fluid
                label="Message Text"
                id="text"
                placeholder="Message Entry"
                value={message.text}
                onChange={handleChange}
              />
              <Button
                fluid
                color="blue"
                size="large"
                type="submit"
                onClick={submitPost.bind(message)}
              >
                Submit
              </Button>
            </Form>
            <Button
              fluid
              color="red"
              size="large"
              type="submit"
              onClick={deletePosts.bind()}
            >
              Delete All
            </Button>
          </Message>
        </Grid.Column>
        <Grid.Column>
          <Message>
            <Card.Group>
              {block.map((post, index) => {
                return (
                  <Card key={index} fluid color="black">
                    <Card.Content textAlign="left">
                      <Card.Header>{post.title}</Card.Header>
                      <Card.Description>{post.text}</Card.Description>
                      <Card.Meta textAlign="right">{post.id}</Card.Meta>
                    </Card.Content>
                  </Card>
                );
              })}
            </Card.Group>
          </Message>
        </Grid.Column>
      </Grid>
    </Segment>
  );
};

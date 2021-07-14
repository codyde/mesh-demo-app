import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  Progress,
  Card,
  Container,
  Grid,
  Button,
  Modal,
  Icon,
  Image,
} from "semantic-ui-react";
import { useInterval } from "./useInterval";
import Radium, { StyleRoot } from "radium";
import { SocketContext } from "../context/socket";

import { slideInLeft, slideInRight, slideInDown } from "react-animations";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import { default as a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism/a11y-dark";

SyntaxHighlighter.registerLanguage("python", json);

export const ProgressExampleIndicating = () => {
  const styles = {
    slideLeft: {
      animation: "x 1s",
      animationName: Radium.keyframes(slideInLeft, "slideInLeft"),
    },
    slideRight: {
      animation: "x 1s",
      animationName: Radium.keyframes(slideInRight, "slideInRight"),
    },
    slideDown: {
      animation: "x 1s",
      animationName: Radium.keyframes(slideInDown, "slideInDown"),
    },
  };
  const ENDPOINT = window.location.protocol + "//" + window.location.host;

  const socket = useContext(SocketContext);

  const THEME = a11yDark;

  const [postsOn, setpostsOn] = useState("off");
  const [usersOn, setusersOn] = useState("off");
  const [dbOn, setDbOn] = useState("off");
  const [redisOn, setredisOn] = useState("off");

  const [redisLoc, setredisLoc] = useState("Disconnected");
  const [dbLoc, setdbLoc] = useState("Disconnected");
  const [userLoc, setuserLoc] = useState("Disconnected");
  const [postLoc, setpostLoc] = useState("Disconnected");

  const [envoyData, setenvoyData] = useState(``);

  function handleEnvoy(path, setstate) {
    setstate(``);
    fetch(ENDPOINT + path)
      .then((res) => res.json())
      .then((res) => {
        setstate(JSON.stringify(res, null, 2));
      });
  }

  function handleErrors(response) {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response;
  }

  useInterval(() => {
    fetch(ENDPOINT + "/api/users/db")
      .then(handleErrors)
      .then((res) => res.json())
      .then((y) => {
        setusersOn("on");
        setdbLoc(y.location);
        setuserLoc(y.location);
      })
      .catch((error) => {
        console.log(error);
        setusersOn("off");
        setdbLoc("Disconnected");
        setuserLoc("Disconnected");
      });
    fetch(ENDPOINT + "/api/posts/db")
      .then(handleErrors)
      .then((res) => res.json())
      .then((y) => {
        setpostsOn("on");
        setDbOn("on");
        setpostLoc(y.location);
      })
      .catch((error) => {
        console.log(error);
        setpostsOn("off");
        setDbOn("off");
        setpostLoc("Disconnected");
      });
    fetch(ENDPOINT + "/api/posts/redis")
      .then(handleErrors)
      .then((res) => res.json())
      .then((y) => {
        setredisOn("on");
        setredisLoc(y.location);
      })
      .catch((error) => {
        console.log(error);
        setredisOn("off");
        setredisLoc("Disconnected");
      });
  }, 2000);

  let postsAPI = null;
  let usersAPI = null;
  let redis = null;
  let db = null;

  if (postsOn === "on") {
    postsAPI = <Progress percent="100" active indicating />;
  } else {
    postsAPI = <Progress percent="100" active error indicating />;
  }

  if (dbOn === "on") {
    db = <Progress percent="100" active indicating />;
  } else {
    db = <Progress percent="100" active error indicating />;
  }

  if (usersOn === "on") {
    usersAPI = <Progress percent="100" active indicating />;
  } else {
    usersAPI = <Progress percent="100" active error indicating />;
  }

  if (redisOn === "on") {
    redis = <Progress percent="100" active indicating />;
  } else {
    redis = <Progress percent="100" active error indicating />;
  }

  function exampleReducer(state, action) {
    switch (action.type) {
      case "OPEN_MODAL":
        return { open: true, dimmer: action.dimmer };
      case "CLOSE_MODAL":
        return { open: false };
      default:
        throw new Error();
    }
  }

  const [state, dispatch] = React.useReducer(exampleReducer, {
    open: false,
    dimmer: undefined,
  });
  const { open, dimmer } = state;

  return (
    <StyleRoot>
      <Container>
        <Grid celled="internally" columns="equal" centered>
          <Grid.Column verticalAlign="middle">
            <div style={styles.slideLeft}>
              <Card raised centered>
                <Card.Content header="POSTS Service" />
                <Card.Content extra>{postsAPI}</Card.Content>
                <Card.Content meta>
                  <Modal
                    dimmer={dimmer}
                    trigger={
                      <Button
                        animated="vertical"
                        basic
                        color="pink"
                        onClick={() =>
                          dispatch({ type: "OPEN_MODAL", dimmer: "blurring" })
                        }
                      >
                        <Button.Content hidden>Envoy</Button.Content>
                        <Button.Content visible>
                          Mesh Zone - {postLoc.toUpperCase()}
                        </Button.Content>
                      </Button>
                    }
                  >
                    <Modal.Header>
                      POSTS - Envoy Sidecar Information
                    </Modal.Header>
                    <Modal.Content>
                      <div>
                        <Modal
                          trigger={
                            <Button
                              basic
                              color="pink"
                              onClick={() =>
                                handleEnvoy(
                                  "/api/posts/envoy/config_dump",
                                  setenvoyData
                                )
                              }
                            >
                              config_dump
                            </Button>
                          }
                        >
                          <Modal.Header>
                            POSTS Service - Envoy Config Dump
                          </Modal.Header>
                          <Modal.Content scrolling>
                            <Modal.Description>
                              <SyntaxHighlighter
                                language="json"
                                style={THEME}
                                wrapLines={true}
                                wrongLongLines={true}
                              >
                                {envoyData}
                              </SyntaxHighlighter>
                            </Modal.Description>
                          </Modal.Content>
                        </Modal>

                        <Modal
                          trigger={
                            <Button
                              basic
                              color="pink"
                              onClick={() =>
                                handleEnvoy(
                                  "/api/posts/envoy/certs",
                                  setenvoyData
                                )
                              }
                            >
                              certs
                            </Button>
                          }
                        >
                          <Modal.Header>
                            POSTS Service - Envoy Certs
                          </Modal.Header>
                          <Modal.Content scrolling>
                            <Modal.Description>
                              <SyntaxHighlighter
                                language="json"
                                style={THEME}
                                wrapLines={true}
                                wrongLongLines={true}
                              >
                                {envoyData}
                              </SyntaxHighlighter>
                            </Modal.Description>
                          </Modal.Content>
                        </Modal>

                        <Modal
                          trigger={
                            <Button
                              basic
                              color="pink"
                              onClick={() =>
                                handleEnvoy(
                                  "/api/posts/envoy/clusters",
                                  setenvoyData
                                )
                              }
                            >
                              clusters
                            </Button>
                          }
                        >
                          <Modal.Header>
                            POSTS Service - Envoy Clusters
                          </Modal.Header>
                          <Modal.Content scrolling>
                            <Modal.Description>
                              <SyntaxHighlighter
                                language="json"
                                style={THEME}
                                wrapLines={true}
                                wrongLongLines={true}
                              >
                                {envoyData}
                              </SyntaxHighlighter>
                            </Modal.Description>
                          </Modal.Content>
                        </Modal>
                      </div>
                    </Modal.Content>
                  </Modal>
                </Card.Content>
              </Card>
            </div>
          </Grid.Column>
          <Grid.Column verticalAlign="middle">
            <div style={styles.slideLeft}>
              <Card raised centered>
                <Card.Content header="USERS Service" />
                <Card.Content extra>{usersAPI}</Card.Content>
                <Card.Content meta>
                  <Modal
                    dimmer={dimmer}
                    trigger={
                      <Button
                        animated="vertical"
                        basic
                        color="pink"
                        onClick={() =>
                          dispatch({ type: "OPEN_MODAL", dimmer: "blurring" })
                        }
                      >
                        <Button.Content hidden>Envoy</Button.Content>
                        <Button.Content visible>
                          Mesh Zone - {userLoc.toUpperCase()}
                        </Button.Content>
                      </Button>
                    }
                  >
                    <Modal.Header>
                      USERS - Envoy Sidecar Information
                    </Modal.Header>
                    <Modal.Content>
                      <div>
                        <Modal
                          trigger={
                            <Button
                              basic
                              color="pink"
                              onClick={() =>
                                handleEnvoy(
                                  "/api/users/envoy/config_dump",
                                  setenvoyData
                                )
                              }
                            >
                              config_dump
                            </Button>
                          }
                        >
                          <Modal.Header>
                            USERS Service - Envoy Config Dump
                          </Modal.Header>
                          <Modal.Content scrolling>
                            <Modal.Description>
                              <SyntaxHighlighter
                                language="json"
                                style={THEME}
                                wrapLines={true}
                                wrongLongLines={true}
                              >
                                {envoyData}
                              </SyntaxHighlighter>
                            </Modal.Description>
                          </Modal.Content>
                        </Modal>

                        <Modal
                          trigger={
                            <Button
                              basic
                              color="pink"
                              onClick={() =>
                                handleEnvoy(
                                  "/api/users/envoy/certs",
                                  setenvoyData
                                )
                              }
                            >
                              certs
                            </Button>
                          }
                        >
                          <Modal.Header>
                            USERS Service - Envoy Certs
                          </Modal.Header>
                          <Modal.Content scrolling>
                            <Modal.Description>
                              <SyntaxHighlighter
                                language="json"
                                style={THEME}
                                wrapLines={true}
                                wrongLongLines={true}
                              >
                                {envoyData}
                              </SyntaxHighlighter>
                            </Modal.Description>
                          </Modal.Content>
                        </Modal>

                        <Modal
                          trigger={
                            <Button
                              basic
                              color="pink"
                              onClick={() =>
                                handleEnvoy(
                                  "/api/users/envoy/clusters",
                                  setenvoyData
                                )
                              }
                            >
                              clusters
                            </Button>
                          }
                        >
                          <Modal.Header>
                            USERS Service - Envoy Clusters
                          </Modal.Header>
                          <Modal.Content scrolling>
                            <Modal.Description>
                              <SyntaxHighlighter
                                language="json"
                                style={THEME}
                                wrapLines={true}
                                wrongLongLines={true}
                              >
                                {envoyData}
                              </SyntaxHighlighter>
                            </Modal.Description>
                          </Modal.Content>
                        </Modal>
                      </div>
                    </Modal.Content>
                  </Modal>
                </Card.Content>
              </Card>
            </div>
          </Grid.Column>
          <Grid.Column verticalAlign="middle">
            <div style={styles.slideRight}>
              <Card raised centered>
                <Card.Content header="POSTGRESQL" />
                <Card.Content extra>{db}</Card.Content>
                <Card.Content meta>
                  <Button basic disabled color="black">
                    <Button.Content>
                      Mesh Zone - {dbLoc.toUpperCase()}
                    </Button.Content>
                  </Button>
                </Card.Content>
              </Card>
            </div>
          </Grid.Column>
          <Grid.Column verticalAlign="middle">
            <div style={styles.slideRight}>
              <Card raised centered>
                <Card.Content header="REDIS" />
                <Card.Content extra>{redis}</Card.Content>
                <Card.Content meta>
                  <Button basic disabled color="black">
                    <Button.Content>
                      Mesh Zone - {redisLoc.toUpperCase()}
                    </Button.Content>
                  </Button>
                </Card.Content>
              </Card>
            </div>
          </Grid.Column>
        </Grid>
      </Container>
    </StyleRoot>
  );
};

import React, { useState, useEffect, useContext } from "react";
import { Progress, Card, Container, Grid } from "semantic-ui-react";
import { useInterval } from "./useInterval";
import socketIOClient from "socket.io-client";
import Radium, { StyleRoot } from "radium";
import { slideInLeft, slideInRight, slideInDown } from "react-animations";

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
  // const ENDPOINT = "http://localhost:5000";
  const ENDPOINT = window.location.protocol + "//" + window.location.host;

  const [response, setResponse] = useState("");

  const [postsOn, setpostsOn] = useState("off");
  const [usersOn, setusersOn] = useState("off");
  const [dbOn, setDbOn] = useState("off");
  const [redisOn, setredisOn] = useState("off");
  const [redisLoc, setredisLoc] = useState("Disconnected");
  const [dbLoc, setdbLoc] = useState("Disconnected");
  const [userLoc, setuserLoc] = useState("Disconnected");
  const [postLoc, setpostLoc] = useState("Disconnected");

  // useEffect(() => {
  //   const socket = socketIOClient(ENDPOINT, {
  //     transports: ["websocket"],
  //   });
  //   socket.on("health event", (data) => {
  //     setResponse(data);
  //     setApiOn("on");
  //   });
  // }, [response, apiOn]);

  useInterval(() => {
    fetch(ENDPOINT + "/api/users/db")
      // .then(handleErrors)
      .then((res) => res.json())
      .then((y) => {
        console.log(y);
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
  }, 2000);

  useInterval(() => {
    fetch(ENDPOINT + "/api/posts/db")
      // .then(handleErrors)
      .then((res) => res.json())
      .then((y) => {
        setpostsOn("on");
        setDbOn("on");
        setpostLoc(y.location);
      })
      .catch((error) => {
        setpostsOn("off");
        setDbOn("off");
        setpostLoc("Disconnected");
      });
  }, 2000);

  useInterval(() => {
    fetch(ENDPOINT + "/api/posts/redis")
      // .then(handleErrors)
      .then((res) => res.json())
      .then((y) => {
        setredisOn("on");
        setredisLoc(y.location);
      })
      .catch((error) => {
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
                  Mesh Zone - {postLoc.toUpperCase()}
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
                  Mesh Zone - {userLoc.toUpperCase()}
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
                  Mesh Zone - {dbLoc.toUpperCase()}
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
                  Mesh Zone - {redisLoc.toUpperCase()}
                </Card.Content>
              </Card>
            </div>
          </Grid.Column>
        </Grid>
      </Container>
    </StyleRoot>
  );
};

import React, { useState, useEffect, useContext } from "react";
import { Progress, Card, Container, Grid } from "semantic-ui-react";
import { useInterval } from "./useInterval";
import socketIOClient from "socket.io-client";
import Radium, { StyleRoot } from "radium";
import { slideInLeft, slideInRight } from "react-animations";

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
  };
  // const ENDPOINT = "http://localhost:5000";
  const ENDPOINT = window.location.protocol + "//" + window.location.host;

  const [response, setResponse] = useState("");

  const [apiOn, setApiOn] = useState("off");
  const [dbOn, setDbOn] = useState("off");

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
    fetch(ENDPOINT + "/api/health")
      // .then(handleErrors)
      .then((res) => res.json())
      .then((y) => {
        setApiOn("on");
      })
      .catch((error) => {
        console.log(error);
        setApiOn("off");
      });
  }, 4000);

  useInterval(() => {
    fetch(ENDPOINT + "/api/posts")
      .then((res) => res.json())
      .then((y) => {
        setDbOn("on");
      })
      .catch((error) => {
        console.log(error);
        setDbOn("off");
      });
  }, 4000);

  let api = null;
  let db = null;

  if (apiOn === "on") {
    api = <Progress percent="100" active indicating />;
  } else {
    api = <Progress percent="100" active error indicating />;
  }

  if (dbOn === "on") {
    db = <Progress percent="100" active indicating />;
  } else {
    db = <Progress percent="100" active error indicating />;
  }

  return (
    <StyleRoot>
      <Container>
        <Grid celled="internally" columns="equal" centered>
          <Grid.Column verticalAlign="middle">
            <div style={styles.slideLeft}>
              <Card raised centered>
                <Card.Content header="API Connectivity" />
                <Card.Content extra>{api}</Card.Content>
              </Card>
            </div>
          </Grid.Column>
          <Grid.Column verticalAlign="middle">
            <div style={styles.slideRight}>
              <Card raised centered>
                <Card.Content header="Database Connectivity" />
                <Card.Content extra>{db}</Card.Content>
              </Card>
            </div>
          </Grid.Column>
        </Grid>
      </Container>
    </StyleRoot>
  );
};

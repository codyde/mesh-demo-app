import React, { useState } from "react";
import "./App.css";
import { Posts } from "./components/cards";
import { HomepageHeading } from "./components/homeHeading";
import { ProgressExampleIndicating } from "./components/progress";
import {
  Menu,
  Responsive,
  Segment,
  Container,
  Button,
  Modal,
  Form,
} from "semantic-ui-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SocketContext, socket } from "./context/socket";
import axios from "axios";

function App() {
  axios.interceptors.request.use(
    async (request) => {
      if (request.url.includes("/api/posts")) {
        request.headers.Authorization = `Bearer ${localStorage.jwtToken}`;
      }
      return request;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  const [open, setOpen] = React.useState(false);

  const ENDPOINT = window.location.protocol + "//" + window.location.host;
  // const ENDPOINT = "http://localhost:5000";

  const [showLogin, setShowLogin] = useState(true);

  const [jwt, setJWT] = React.useState("");

  const notify = (jwt) =>
    toast.success("Welcome " + jwt + "!", {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

  const bye = () =>
    toast.success("Logged out!", {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

  function log(bool) {
    setShowLogin(bool);
    return showLogin;
  }

  function handleErrors(response) {
    if (!response.ok) {
      console.log("Login Failed");
      throw Error(response.statusText);
    }
    return response;
  }

  function submitLogin(data) {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: state.username,
        password: state.password,
      }),
    };
    fetch(ENDPOINT + "/api/loginEndpoint", requestOptions)
      .then(handleErrors)
      .then((res) => res.json())
      .then((res) => {
        log(false);
        setJWT(res.jwtToken);
        localStorage.setItem("jwtToken", res.jwtToken);
        setOpen(false);
        notify(res.token.user_id);
        console.log(showLogin);
      });
  }

  function submitLogout() {
    bye();
    setOpen(false);
    localStorage.clear();
    log(true);
  }

  const [state, setState] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setState((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  return (
    <Responsive>
      <style>
        {`
      html, body {
        background-color: #252839 !important;
      }
      p {
        align-content: center;
        background-color: #495285;
        color: #fff;
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-height: 6em;
      }
      p > span {
        opacity: 0.4;
        text-align: center;
      }
    }
    `}
      </style>
      <Segment
        textAlign="left"
        style={{ minHeight: 700, padding: "1em 0em" }}
        vertical
      >
        <Menu inverted borderless pointing secondary size="large">
          <Container>
            <Menu.Item as="a" active>
              Home
            </Menu.Item>
            <Menu.Item position="right">
              <Modal
                onClose={() => setOpen(false)}
                onOpen={() => setOpen(true)}
                open={open}
                trigger={
                  <Button color={showLogin ? "blue" : "red"}>
                    {showLogin ? "Login" : " Logout"}
                  </Button>
                }
              >
                {showLogin ? (
                  <Form size="large">
                    <Segment stacked>
                      <Form.Input
                        fluid
                        icon="user"
                        id="username"
                        iconPosition="left"
                        placeholder="Username"
                        value={state.username}
                        onChange={handleChange}
                      />
                      <Form.Input
                        fluid
                        icon="lock"
                        id="password"
                        iconPosition="left"
                        placeholder="Password"
                        type="password"
                        value={state.password}
                        onChange={handleChange}
                      />

                      <Button
                        type="submit"
                        color="blue"
                        fluid
                        size="large"
                        onClick={submitLogin.bind(state)}
                      >
                        Login
                      </Button>
                    </Segment>
                  </Form>
                ) : (
                  <Button
                    type="submit"
                    color="red"
                    fluid
                    size="large"
                    onClick={submitLogout.bind()}
                  >
                    Logout
                  </Button>
                )}
              </Modal>
            </Menu.Item>
          </Container>
        </Menu>
        <HomepageHeading />
        {/* <SocketContext.Provider value={socket}> */}
        <ProgressExampleIndicating />
        <ToastContainer
          bodyClassName="toastBody"
          position="top-center"
          autoClose={5000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Posts />
        {/* </SocketContext.Provider> */}
      </Segment>
    </Responsive>
  );
}

export default App;

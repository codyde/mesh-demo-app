import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import "semantic-ui-css/semantic.min.css";
// import { asyncWithLDProvider } from "launchdarkly-react-client-sdk";

// (async () => {
//   const LDProvider = await asyncWithLDProvider({
//     clientSideID: "60d0e473e5577c0cf09d6ff5",
//   });

ReactDOM.render(
  // <LDProvider>
  <App />,
  // </LDProvider>,
  document.getElementById("root")
);
// })();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();

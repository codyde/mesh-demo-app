import React from "react";
import kong from "../kong-community-team_512x512.png";
import { Container, Image } from "semantic-ui-react";
import { slideInDown } from "react-animations";
import Radium, { StyleRoot } from "radium";

const styles = {
  SlideDown: {
    animation: "x 1s",
    animationName: Radium.keyframes(slideInDown, "slideInDown"),
  },
};
export const HomepageHeading = () => (
  <StyleRoot>
    <Container>
      <div style={styles.SlideDown}>
        <Image src={kong} size="medium" centered />
      </div>
    </Container>
  </StyleRoot>
);

import React from "react";
import Svg, { Path } from "react-native-svg";

interface BackIcon2Props {
  size?: number;
  color?: string;
}

const ScrollIcon: React.FC<BackIcon2Props> = ({
  size = 24,
  color = "#FFFFFF",
}) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      d="M11.31 4.37 9.17 7.5A1 1 0 0 0 9.86 9h4.28a1 1 0 0 0 .69-1.5l-2.14-3.13a.82.82 0 0 0-1.38 0Z"
      fill="#FFFFFF"
    />
    <Path
      d="m12.69 19.62 2.14-3.12a1 1 0 0 0-.69-1.5H9.86a1 1 0 0 0-.69 1.5l2.14 3.12a.82.82 0 0 0 1.38 0Z"
      fill="#FFFFFF"
    />
  </Svg>
);

export default ScrollIcon;

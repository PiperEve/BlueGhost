/// <reference types="nativewind/types" />

// For importing SVGs as React components
declare module "*.svg" {
  import React from "react";
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}

// You can add more global declarations here if needed
import React from "react";
import { Circle, Image, Layer, Stage } from "react-konva";
import useImage from "use-image";

export const Test = () => {
  const [image] = useImage("./assets/hospital-floor-plan.jpeg");
  const [imageWidth, setImageWidth] = React.useState(0);
  const [imageHeight, setImageHeight] = React.useState(0);
  const [pinPosition, setPinPosition] = React.useState({ x: 0, y: 0 });

  const handleImageLoad = (e) => {
    const { width, height } = e.target;
    console.log({ width, height });
    setImageWidth(width);
    setImageHeight(height);
  };

  const handlePinMove = (e) => {
    setPinPosition({ x: e.target.x(), y: e.target.y() });
  };

  const handleStageResize = (width, height) => {
    console.log("here?");
    const newWidth = width;
    const newHeight = (height / width) * newWidth;
    setImageWidth(newWidth);
    setImageHeight(newHeight);
  };

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onResize={handleStageResize}
    >
      <Layer>
        <Image
          x={0}
          y={0}
          width={image.width}
          height={image.height}
          image={image}
          onLoad={handleImageLoad}
        />
        <Circle
          x={pinPosition.x}
          y={pinPosition.y}
          radius={10}
          fill="red"
          draggable
          onDragMove={handlePinMove}
        />
      </Layer>
    </Stage>
  );
};

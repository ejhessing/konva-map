import Konva from "konva";
import { Image, Line, Rect } from "react-konva";
import useImage from "use-image";
import { calculateAspectRatioFit } from "./helper";

interface Props {
  url: string;
  maxWidth: number;
  maxHeight: number;
  markerRef: React.MutableRefObject<Konva.Image | null>;
  location: { x: number; y: number };
  mapSize: { width: number; height: number };
}

export const Marker = ({
  url,
  maxWidth = 0,
  maxHeight = 0,
  markerRef,
  location,
  mapSize,
}: Props) => {
  const [markerImg] = useImage(url);
  const imageWidth = markerImg?.naturalWidth || 0;
  const imageHeight = markerImg?.naturalHeight || 0;

  const scaleDown = 0.05;

  const { width: newWidth, height: newHeight } = calculateAspectRatioFit(
    imageWidth,
    imageHeight,
    maxWidth * scaleDown,
    maxHeight * scaleDown
  );

  // Center location map
  const x = maxWidth / 2 || 0;
  const y = maxHeight / 2 || 0;
  // const x = location.x * maxWidth || (maxWidth - newWidth) / 2 || 0;
  // const y = location.y * maxHeight || (maxHeight - newHeight) / 2 || 0;

  const coordsX = maxWidth / 2 || 0;
  const coordsY = maxHeight / 2 || 0;
  // const coordsX = (location.x * maxWidth) / mapSize.width || maxWidth / 2 || 0;
  // const coordsY = (location.y * maxWidth) / mapSize.width || maxHeight / 2 || 0;
  return (
    <>
      <Rect width={maxWidth} height={maxHeight} x={0} y={0} />
      <Image
        image={markerImg}
        width={newWidth || 0}
        height={newHeight || 0}
        x={x}
        y={y}
        ref={markerRef}
      />
      <Line
        points={[coordsX + newWidth / 2, -10000, coordsX + newWidth / 2, 10000]}
        stroke="red"
        strokeWidth={1}
        opacity={0.5}
      />
      <Line
        points={[
          -10000,
          coordsY + newHeight || 0,
          10000,
          coordsY + newHeight || 0,
        ]}
        stroke="red"
        strokeWidth={1}
        opacity={0.5}
      />
    </>
  );
};

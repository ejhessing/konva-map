import Konva from "konva";
import { Image, Line, Rect } from "react-konva";
import useImage from "use-image";
import { calculateAspectRatioFit } from "./helper";

interface Props {
  url: string;
  maxWidth: number;
  maxHeight: number;
  markerRef: React.MutableRefObject<Konva.Image | null>;
}

export const Marker = ({
  url,
  maxWidth = 0,
  maxHeight = 0,
  markerRef,
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
  const x = (maxWidth - newWidth) / 2;
  const y = (maxHeight - newHeight) / 2;

  return (
    <>
      <Rect width={maxWidth} height={maxHeight} x={0} y={0} />
      <Image
        image={markerImg}
        width={newWidth || 0}
        height={newHeight || 0}
        x={x || 0}
        y={y || 0}
        ref={markerRef}
      />
      <Line
        points={[maxWidth / 2 || 0, -10000, maxWidth / 2 || 0, 10000]}
        stroke="red"
        strokeWidth={1}
        opacity={0.5}
      />
      <Line
        points={[
          -10000,
          maxHeight / 2 + newHeight / 2 || 0,
          10000,
          maxHeight / 2 + newHeight / 2 || 0,
        ]}
        stroke="red"
        strokeWidth={1}
        opacity={0.5}
      />
    </>
  );
};

import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { Image } from "react-konva";
import useImage from "use-image";
import { calculateAspectRatioFit } from "./helper";

interface Props {
  url: string;
  maxWidth: number;
  maxHeight: number;
  markerRef: React.MutableRefObject<Konva.Image | null>;
  location: Vector2d;
}

export const MarkerImage = ({
  url,
  maxWidth = 0,
  maxHeight = 0,
  markerRef,
  location,
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

  return (
    <>
      <Image
        image={markerImg}
        width={newWidth || 0}
        height={newHeight || 0}
        x={location.x || 0}
        y={location.y || 0}
        ref={markerRef}
      />
    </>
  );
};

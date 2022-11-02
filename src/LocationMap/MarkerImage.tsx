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
  mapSize: { width: number; height: number };
  mapRef: React.MutableRefObject<Konva.Image | null>;
  stageRef: React.MutableRefObject<Konva.Stage | null>;
}

export const MarkerImage = ({
  url,
  maxWidth = 0,
  maxHeight = 0,
  markerRef,
  location,
  mapSize,
  mapRef,
  stageRef,
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
  if (stageRef.current === null || mapRef.current === null) return <></>;

  var transform = stageRef.current.getAbsoluteTransform().copy();
  // to detect relative position we need to invert transform
  transform.invert();

  const mapPos = mapRef.current.getClientRect();
  var mapPoint = transform.point(mapPos);
  const x = location.x * mapSize.width + mapPoint.x;
  const y = location.y * mapSize.height + mapPoint.y;

  console.log({ mapPoint, location, mapSize, x, y });
  return (
    <>
      <Image
        image={markerImg}
        width={newWidth || 0}
        height={newHeight || 0}
        x={x || 0}
        y={y || 0}
        ref={markerRef}
      />
    </>
  );
};

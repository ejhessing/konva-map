import Konva from "konva";
import { useEffect } from "react";
import { Image, Line, Rect } from "react-konva";
import useImage from "use-image";
import { calculateAspectRatioFit } from "./helper";

interface Props {
  url: string;
  maxWidth: number;
  maxHeight: number;
  markerRef: React.MutableRefObject<Konva.Image | null>;
  tempLocation: { x: number; y: number };
  mapSize: { width: number; height: number };
  mapRef: React.MutableRefObject<Konva.Image | null>;
  stageRef: React.MutableRefObject<Konva.Stage | null>;
  mapRatio: number;
  setMarkerSize: (w: number, h: number) => void;
}

export const Marker = ({
  url,
  maxWidth = 0,
  maxHeight = 0,
  markerRef,
  tempLocation,
  mapSize,
  mapRef,
  stageRef,
  mapRatio,
  setMarkerSize,
}: Props) => {
  const [markerImg] = useImage(url);
  const imageWidth = markerImg?.naturalWidth || 0;
  const imageHeight = markerImg?.naturalHeight || 0;

  const scaleDown = 0.05;

  const { width: newWidth = 0, height: newHeight = 0 } =
    calculateAspectRatioFit(
      imageWidth,
      imageHeight,
      maxWidth * scaleDown,
      maxHeight * scaleDown
    );

  useEffect(() => {
    if (newWidth && newHeight) {
      setMarkerSize(newWidth, newHeight);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newHeight, newWidth]);

  if (stageRef.current === null || mapRef.current === null) return <></>;

  var transform = stageRef.current.getAbsoluteTransform().copy();
  // to detect relative position we need to invert transform
  transform.invert();

  const mapPos = mapRef.current.getClientRect();
  // Location of absolute position of where the map starts
  var mapPoint = transform.point(mapPos);
  // location of where the point is if map starts at 0,0
  // Times by the size of the image
  // plus the location of where map starts
  const originalMapSize = {
    width: mapSize.width / mapRatio,
    height: mapSize.height / mapRatio,
  };

  const x =
    (tempLocation.x / originalMapSize.width) * mapSize.width + mapPoint.x;
  const y =
    (tempLocation.y / originalMapSize.height) * mapSize.height + mapPoint.y;

  return (
    <>
      {!!tempLocation.x && (
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
            points={[x + newWidth / 2, -10000, x + newWidth / 2, 10000]}
            stroke="red"
            strokeWidth={1}
            opacity={0.5}
          />
          <Line
            points={[-10000, y + newHeight || 0, 10000, y + newHeight || 0]}
            stroke="red"
            strokeWidth={1}
            opacity={0.5}
          />
        </>
      )}
    </>
  );
};

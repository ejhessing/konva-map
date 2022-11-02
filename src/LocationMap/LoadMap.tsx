import Konva from "konva";
import { useEffect } from "react";
import { Image } from "react-konva";
import useImage from "use-image";
import { calculateAspectRatioFit } from "./helper";

interface Props {
  url: string;
  mapWidth: number;
  mapHeight: number;
  mapRef: React.MutableRefObject<Konva.Image | null>;
  setMapSize: (width: number, height: number) => void;
  setMapRatio: (x: number) => void;
}

export const LoadMap = ({
  url,
  mapWidth = 0,
  mapHeight = 0,
  mapRef,
  setMapSize,
  setMapRatio,
}: Props) => {
  const [image] = useImage(url);
  const imageWidth = image?.naturalWidth || 0;
  const imageHeight = image?.naturalHeight || 0;
  console.log({ imageWidth, imageHeight });
  const { width: newWidth, height: newHeight } = calculateAspectRatioFit(
    imageWidth,
    imageHeight,
    mapWidth,
    mapHeight
  );

  // Center location map
  const x = (mapWidth - newWidth) / 2;
  const y = (mapHeight - newHeight) / 2;

  useEffect(() => {
    if (newWidth && newHeight) {
      setMapSize(newWidth, newHeight);
      var ratio = Math.min(mapWidth / imageWidth, mapHeight / imageHeight);
      setMapRatio(ratio);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newWidth, newHeight]);

  return (
    <Image
      ref={mapRef}
      image={image}
      width={newWidth || 0}
      height={newHeight || 0}
      x={x || 0}
      y={y || 0}
    />
  );
};

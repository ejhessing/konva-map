import Konva from "konva";
import { Image } from "react-konva";
import useImage from "use-image";
import { calculateAspectRatioFit } from "./helper";

interface Props {
  url: string;
  mapWidth: number;
  mapHeight: number;
  mapRef: React.MutableRefObject<Konva.Image | null>;
}

export const LoadMap = ({
  url,
  mapWidth = 0,
  mapHeight = 0,
  mapRef,
}: Props) => {
  const [image] = useImage(url);
  const imageWidth = image?.naturalWidth || 0;
  const imageHeight = image?.naturalHeight || 0;
  const { width: newWidth, height: newHeight } = calculateAspectRatioFit(
    imageWidth,
    imageHeight,
    mapWidth,
    mapHeight
  );

  // Center location map
  const x = (mapWidth - newWidth) / 2 - 4;
  const y = (mapHeight - newHeight) / 2 - 4;

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

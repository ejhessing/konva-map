import { Image } from "react-konva";
import useImage from "use-image";

interface Props {
  url: string;
  mapWidth: number;
  mapHeight: number;
}

export function calculateAspectRatioFit(
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number
) {
  var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

  return { width: srcWidth * ratio, height: srcHeight * ratio };
}

export const LoadMap = ({ url, mapWidth, mapHeight }: Props) => {
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
  const x = (mapWidth - newWidth) / 2;
  const y = (mapHeight - newHeight) / 2;
  return (
    <Image image={image} width={newWidth} height={newHeight} x={x} y={y} />
  );
};

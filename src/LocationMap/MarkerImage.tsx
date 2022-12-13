import { Image } from "react-konva";
import useImage from "use-image";

interface Props {
  url: string;
  markerLocation: { x: number; y: number };
}

export const MarkerImage = ({ url, markerLocation }: Props) => {
  const [markerImg] = useImage(url);

  return (
    <Image
      image={markerImg}
      width={100}
      height={100}
      x={markerLocation.x}
      y={markerLocation.y}
    />
  );
};

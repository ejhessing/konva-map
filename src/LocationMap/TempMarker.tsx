import Konva from "konva";
import { Group, Image, Line, Rect } from "react-konva";
import useImage from "use-image";

interface Props {
  url: string;
  tempLocation: { x: number; y: number };
  tempMarkerRef: React.MutableRefObject<Konva.Image | null>;
  mapRef: React.MutableRefObject<Konva.Image | null>;
  setTempLocation: (x: number, y: number) => void;
}

export const TempMarker = ({
  url,
  tempLocation,
  tempMarkerRef,
  mapRef,
  setTempLocation,
}: Props) => {
  const [markerImg] = useImage(url);

  const x = tempLocation.x;
  const y = tempLocation.y;

  const onDragEnd = (pos: { x: number; y: number }) => {
    if (tempMarkerRef.current === null) return;
    const posTemp = tempMarkerRef.current?.absolutePosition();
    console.log({ posTemp });
    console.log({ pos });
    setTempLocation(pos.x, pos.y);
  };

  return (
    <Group
      x={x}
      y={y}
      draggable
      onDragEnd={(e) => {
        onDragEnd({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
    >
      <Rect
        width={mapRef.current?.width()}
        height={mapRef.current?.height()}
        x={-x}
        y={-y}
      />
      <Image
        image={markerImg}
        width={100}
        height={100}
        x={0}
        y={0}
        ref={tempMarkerRef}
      />
      <Line
        points={[-x, 100, 10000, 100]}
        stroke="red"
        strokeWidth={1}
        opacity={1}
      />
      <Line
        points={[50, -y, 50, 10000]}
        stroke="red"
        strokeWidth={1}
        opacity={1}
      />
    </Group>
  );
};

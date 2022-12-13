import Konva from "konva";
import { Group, Image } from "react-konva";
import useImage from "use-image";
import { MarkerImage } from "./MarkerImage";
import { TempMarker } from "./TempMarker";

interface Props {
  url: string;
  maxWidth: number;
  maxHeight: number;
  mapRef: React.MutableRefObject<Konva.Image | null>;
  tempMarkerRef: React.MutableRefObject<Konva.Image | null>;
  tempLocation: { x: number; y: number };
  markerLocation: { x: number; y: number };
  markerMode: boolean;
  setTempLocation: (x: number, y: number) => void;
}

export const LoadMapAndMarkers = ({
  url,
  maxWidth = 0,
  maxHeight = 0,
  mapRef,
  tempMarkerRef,
  tempLocation,
  markerLocation,
  markerMode,
  setTempLocation,
}: Props) => {
  const [image] = useImage(url);
  const imageWidth = image?.naturalWidth || 0;
  const imageHeight = image?.naturalHeight || 0;

  const scaleX = maxWidth / imageWidth;
  const scaleY = maxHeight / imageHeight;
  const scale = Math.min(scaleX, scaleY);
  console.log({ imageWidth, imageHeight, scale });
  console.log({ x: markerLocation.x, y: markerLocation.y });

  const handleOnClickTap = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!mapRef.current) return;

    const markerH = tempMarkerRef.current?.height() || 0;
    const markerW = tempMarkerRef.current?.width() || 0;

    const pos = mapRef.current.getRelativePointerPosition();

    setTempLocation(pos.x - markerW / 2, pos.y - markerH);
  };

  return (
    <Group
      width={imageWidth || 0}
      height={imageHeight || 0}
      x={0}
      y={0}
      scaleX={scale}
      scaleY={scale}
      onClick={handleOnClickTap}
      onTap={handleOnClickTap}
    >
      <Image
        ref={mapRef}
        image={image}
        width={imageWidth || 0}
        height={imageHeight || 0}
        x={0}
        y={0}
      />
      {!markerMode && !!markerLocation.x && (
        <MarkerImage
          url={"./assets/marker.png"}
          markerLocation={markerLocation}
        />
      )}
      {markerMode && (
        <TempMarker
          url={"./assets/tempMarker.png"}
          tempMarkerRef={tempMarkerRef}
          tempLocation={tempLocation}
          setTempLocation={setTempLocation}
          mapRef={mapRef}
        />
      )}
    </Group>
  );
};

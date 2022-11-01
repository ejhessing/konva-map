/* eslint-disable @typescript-eslint/no-unused-vars */
import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { useEffect, useRef, useState } from "react";
import { Group, Layer, Stage } from "react-konva";
import { ToolBar } from "../Toolbar";
import { LoadMap } from "./LoadMap";
import { Marker } from "./Marker";
import { MarkerImage } from "./MarkerImage";

import PinchZoom from "pinch-zoom-js";

const scaleBy = 1.01;

interface Points {
  x: number;
  y: number;
}

function getDistance(p1: Points, p2: Points) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function getCenter(p1: Points, p2: Points) {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

// function isTouchEnabled() {
//   return (
//     "ontouchstart" in window ||
//     navigator.maxTouchPoints > 0 ||
//     navigator.maxTouchPoints > 0
//   );
// }

interface Props {
  markerMode: boolean;
  setMarkerMode: (markerMode: boolean) => void;
  markerLocation: Vector2d;
  setMarkerLocation: ({ x, y }: Vector2d) => void;
}

export const LocationMap = ({
  markerMode,
  setMarkerMode,
  setMarkerLocation,
  markerLocation,
}: Props) => {
  const stageRef = useRef<Konva.Stage>(null);
  const mapRef = useRef<Konva.Image | null>(null);
  const markerRef = useRef<Konva.Image | null>(null);
  const markerImageRef = useRef<Konva.Image | null>(null);
  const [maxWidth, setMaxWidth] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);

  const [, setIsPinching] = useState(false);
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  useEffect(() => {
    var container = document.querySelector("#stage-parent");
    // @ts-ignore
    stageRef.current?.width(container?.offsetWidth || 500);
    // @ts-ignore
    setMaxHeight(container?.offsetHeight || 500);
    // @ts-ignore
    setMaxWidth(container?.offsetWidth || 500);
    // @ts-ignore
    stageRef.current?.height(container?.offsetHeight || 600);
  }, []);

  useEffect(() => {
    var myElement = document.querySelector("canvas");
    if (myElement) {
      var pz = new PinchZoom(myElement, {
        draggableUnzoomed: false,
        minZoom: 1,
      });
    }
  });

  let lastCenter: Points | null = null;
  let lastDist = 0;

  function zoomStage(event: Konva.KonvaEventObject<WheelEvent>) {
    event.evt.preventDefault();
    if (stageRef.current !== null) {
      const stage = stageRef.current;
      const oldScale = stage.scaleX();

      const { x: pointerX, y: pointerY } =
        stage.getPointerPosition() as unknown as Vector2d;
      const mousePointTo = {
        x: (pointerX - stage.x()) / oldScale,
        y: (pointerY - stage.y()) / oldScale,
      };
      let newScale =
        event.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
      if (newScale <= 1) {
        newScale = 1;
      }

      stage.scale({ x: newScale, y: newScale });
      const newPos = {
        x: pointerX - mousePointTo.x * newScale,
        y: pointerY - mousePointTo.y * newScale,
      };
      stage.position(newPos);
      stage.batchDraw();
    }
  }

  const setScale = (scale: number) => {
    // e.evt.preventDefault();
    const stage = stageRef.current;

    if (!stage) return;
    var oldScale = stage.scaleX();

    var center = {
      x: stage.width() / 2,
      y: stage.height() / 2,
    };
    var relatedTo = {
      x: (center.x - stage.x()) / oldScale,
      y: (center.y - stage.y()) / oldScale,
    };

    var newScale = scale;
    stage.scale({
      x: newScale,
      y: newScale,
    });

    setZoomLevel(newScale);
    var newPos = {
      x: center.x - relatedTo.x * newScale,
      y: center.y - relatedTo.y * newScale,
    };

    stage.position(newPos);
    stage.batchDraw();
  };

  // function handleTouch(e: Konva.KonvaEventObject<TouchEvent>) {
  //   e.evt.preventDefault();

  //   var touch1 = e.evt.touches[0];
  //   var touch2 = e.evt.touches[1];
  //   const stage = stageRef.current;
  //   if (stage !== null) {
  //     if (touch1 && touch2) {
  //       var p1 = {
  //         x: touch1.clientX,
  //         y: touch1.clientY,
  //       };
  //       var p2 = {
  //         x: touch2.clientX,
  //         y: touch2.clientY,
  //       };
  //       console.log({ p1, p2, lastCenter });
  //       if (!lastCenter) {
  //         lastCenter = getCenter(p1, p2);
  //         return;
  //       }
  //       var newCenter = getCenter(p1, p2);
  //       console.log({ newCenter });
  //       var dist = getDistance(p1, p2);
  //       console.log({ dist, lastDist });
  //       if (!lastDist) {
  //         lastDist = dist;
  //       }

  //       // local coordinates of center point
  //       var pointTo = {
  //         x: (newCenter.x - stage.x()) / stage.scaleX(),
  //         y: (newCenter.y - stage.y()) / stage.scaleX(),
  //       };
  //       console.log({ pointTo });
  //       var scale = stage.scaleX() * (dist / lastDist);
  //       console.log({ scale });
  //       if (scale < 1) {
  //         scale = 1;
  //       }
  //       stage.scaleX(scale);
  //       stage.scaleY(scale);

  //       // calculate new position of the stage
  //       var dx = newCenter.x - lastCenter.x;
  //       var dy = newCenter.y - lastCenter.y;
  //       console.log({ dx, dy });
  //       var newPos = {
  //         x: newCenter.x - pointTo.x * scale + dx,
  //         y: newCenter.y - pointTo.y * scale + dy,
  //       };
  //       console.log({ newPos });
  //       // TODO: check if this is right on mobile
  //       if (stage.scaleX() <= 1) {
  //         newPos = {
  //           x: lastCenter.x,
  //           y: lastCenter.y,
  //         };
  //       }

  //       stage.position(newPos);
  //       stage.batchDraw();

  //       lastDist = dist;
  //       lastCenter = newCenter;
  //       console.log({ lastDist, lastCenter });
  //     }
  //   }
  // }

  // function handleTouchEnd() {
  //   lastCenter = null;
  //   lastDist = 0;
  //   setIsPinching(false);
  //   // stageRef.current?.draggable(true);
  // }

  // function handleTouchDown(e: Konva.KonvaEventObject<TouchEvent>) {
  //   e.evt.preventDefault();
  //   if (e.evt.touches.length === 2 && stageRef.current !== null) {
  //     setIsPinching(true);
  //     // stageRef.current.draggable(false);
  //   }
  // }

  const handleDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
    const stage = e.target.getStage();

    if (!stage) return;
  };

  const onHandleMarkerSet = () => {
    if (
      markerRef.current === null ||
      stageRef.current === null ||
      mapRef.current === null
    )
      return;

    var transform = stageRef.current.getAbsoluteTransform().copy();
    // to detect relative position we need to invert transform
    transform.invert();
    // now we find relative point
    const pos = markerRef.current.getClientRect();
    var point = transform.point(pos);

    const mapPos = mapRef.current.getClientRect();
    var mapPoint = transform.point(mapPos);
    console.log({
      x: (point.x - mapPoint.x) / maxWidth,
      y: (point.y - mapPoint.y) / maxWidth,
    });
    setMarkerLocation({
      x: (point.x - mapPoint.x) / maxWidth,
      y: (point.y - mapPoint.y) / maxWidth,
    });
  };

  return (
    <div className="p-3 w-full h-full">
      <div className="w-full h-5/6" id="stage-parent">
        <ToolBar
          zoomIn={() => setScale(zoomLevel + 0.25)}
          zoomOut={() => {
            if (zoomLevel <= 1) {
              return;
            }
            setScale(zoomLevel - 0.25);
          }}
          zoomReset={() => setScale(1)}
        />
        <Stage
          ref={stageRef}
          width={500}
          height={500}
          className="bg-slate-200 border-2  border-blue-600"
          // draggable={true}
          draggable={!markerMode}
          onWheel={zoomStage}
          // onTouchDown={handleTouchDown}
          // onTouchMove={handleTouch}
          // onTouchEnd={handleTouchEnd}
          perfectDrawEnabled={false}
          onDragStart={handleDragStart}
          onDragEnd={(e) => {
            const stage = stageRef.current;
            if (stage !== null) {
              const scale = stage.scaleX();
              if (scale <= 1) {
                var newPos = {
                  x: 0,
                  y: 0,
                };
                stage.position(newPos);
                stage.batchDraw();
              }
            }
          }}
        >
          <Layer perfectDrawEnabled={false}>
            <Group>
              <LoadMap
                url={
                  "https://tabex-logo.s3.ap-southeast-2.amazonaws.com/hospital-floor-plan-medical-office-building-plans_88886.jpeg"
                }
                mapHeight={maxHeight}
                mapWidth={maxWidth}
                mapRef={mapRef}
                setMapSize={(w: number, h: number) =>
                  setMapSize({ width: w, height: h })
                }
              />
              {!!markerLocation.x && (
                <MarkerImage
                  url={
                    "https://tabex-logo.s3.ap-southeast-2.amazonaws.com/5888920ebc2fc2ef3a1860a9+(1).png"
                  }
                  maxWidth={maxWidth}
                  maxHeight={maxHeight}
                  markerRef={markerImageRef}
                  location={markerLocation}
                  mapSize={mapSize}
                  mapRef={mapRef}
                  stageRef={stageRef}
                />
              )}
            </Group>
          </Layer>
          {markerMode && (
            <Layer draggable>
              <Group>
                <Marker
                  url={
                    "https://tabex-logo.s3.ap-southeast-2.amazonaws.com/5888925dbc2fc2ef3a1860ad.png"
                  }
                  maxWidth={maxWidth}
                  maxHeight={maxHeight}
                  markerRef={markerRef}
                  location={markerLocation}
                  mapSize={mapSize}
                />
              </Group>
            </Layer>
          )}
        </Stage>
        {!markerMode && (
          <div>
            <button
              onClick={() => setMarkerMode(true)}
              className="bg-blue-600 border-blue-800 p-2 my-2 w-full rounded-lg text-white"
            >
              {" "}
              Add Marker
            </button>
          </div>
        )}
        {markerMode && (
          <div className="flex w-full content-center ">
            <button
              onClick={() => onHandleMarkerSet()}
              className="bg-blue-600 border-blue-800 p-2 w-full m-2 rounded-lg  text-white"
            >
              Set location
            </button>
            <button
              onClick={() => setMarkerMode(false)}
              className="bg-gray-600 border-gray-800 p-2 w-full m-2 rounded-lg  text-white"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

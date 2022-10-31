import {
  MagnifyingGlassIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from "@heroicons/react/24/solid";

interface Props {
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;
}

export const ToolBar = ({ zoomIn, zoomOut, zoomReset }: Props) => {
  return (
    <div className="absolute top-5 left-5 z-40 bg-gray-100 border rounded-lg border-gray-400 ">
      <div className="flex text-center text-secondary-50 divide-x divide-gray-800 rounded-l-none divide-dashed">
        <button className="bg-primary-default  " onClick={zoomIn}>
          <MagnifyingGlassPlusIcon className="h-6 w-6 m-2" aria-hidden="true" />
        </button>
        <button className="bg-primary-default " onClick={zoomOut}>
          <MagnifyingGlassMinusIcon
            className="h-6 w-6 m-2"
            aria-hidden="true"
          />
        </button>
        <button className="bg-primary-default " onClick={zoomReset}>
          <MagnifyingGlassIcon className="h-6 w-6 m-2" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

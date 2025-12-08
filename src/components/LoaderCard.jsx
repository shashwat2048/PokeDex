import clsx from "clsx";

export default function LoaderCard() {
  return (
    <li 
      className={clsx(
        "rounded-br-lg rounded-tl-lg flex flex-col overflow-hidden bg-slate-50 dark:bg-gray-700",
      )}
      role="listitem"
      aria-label="Loading Pokémon card"
    >
      <div className={clsx(
        "rounded-br-full pt-4 flex flex-col overflow-hidden bg-white dark:bg-gray-800 shadow-lg",
        "animate-pulse"
      )}
      aria-busy="true"
      aria-live="polite"
      >
        <div className="flex justify-between items-center mb-2 px-4">
          <span className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/5"></span>
          <span className="flex flex-row gap-2">
            <span className="h-[20px] w-[20px] bg-gray-200 dark:bg-gray-600 rounded-full"></span>
            <span className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16"></span>
          </span>
        </div>
        <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mx-4 mb-4"></div>
        <div className="flex justify-center my-2">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 px-4 mb-4">
          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded-full text-xs w-12 h-4"></span>
          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded-full text-xs w-12 h-4"></span>
        </div>
      </div>
      <div className="px-2 py-1 rounded-br-lg rounded-tl-lg bg-gray-200 dark:bg-gray-600 m-3 h-6 animate-pulse"></div>
      <span className="sr-only">Loading...</span>
    </li>
  );
}

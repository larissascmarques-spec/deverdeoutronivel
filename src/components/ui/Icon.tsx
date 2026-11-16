export function Icon({
  name,
  size = 22,
}: {
  name: "book" | "plus" | "folder" | "check" | "arrow" | "search";
  size?: number;
}) {
  const paths = {
    book: (
      <>
        <path d="M12 6c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Z" />
        <path d="M12 6v15" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    folder: <path d="M3 7V5h7l2 3h9v12H3V7Z" />,
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

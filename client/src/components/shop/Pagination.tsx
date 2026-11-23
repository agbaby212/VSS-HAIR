import { Button } from "../ui/Button";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
};

export function Pagination({ page, totalPages, onPage }: PaginationProps) {
  if (totalPages <= 1) return null; // one page needs no controls
  return (
    <nav aria-label="Pages" className="mt-10 flex items-center justify-between gap-4">
      <Button variant="secondary" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Previous page
      </Button>
      <p>
        Page {page} of {totalPages}
      </p>
      <Button variant="secondary" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
        Next page
      </Button>
    </nav>
  );
}
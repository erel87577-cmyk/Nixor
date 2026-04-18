interface LibraryFiltersProps {
  activeFilter: string;
  onFilterChange: (value: string) => void;
}

const filterOptions = ["all", "authors", "tags", "recent"] as const;

export function LibraryFilters({ activeFilter, onFilterChange }: LibraryFiltersProps) {
  return (
    <div className="filter-row" role="group" aria-label="Library filters">
      {filterOptions.map((option) => (
        <button
          key={option}
          type="button"
          className={activeFilter === option ? "filter-chip filter-chip--active" : "filter-chip"}
          onClick={() => onFilterChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

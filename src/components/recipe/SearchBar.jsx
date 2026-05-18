import { Search } from "lucide-react";

function SearchBar({ value, onChange, placeholder = "Search recipes..." }) {
  return (
    <div className="search-bar-wrap">
      <Search size={18} className="search-bar-icon" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export default SearchBar;

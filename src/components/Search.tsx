import { useState, useEffect } from "react";
import "./Search.css";

interface SearchResponseItem {
  id: number;
  full_name: string;
  html_url: string;
  description: string;
}

interface SearchResponse {
  total_count: number;
  items: SearchResponseItem[];
}

function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResponseItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      setIsLoading(true);
      if (!searchTerm) {
        setSearchResults([]);
        setTotalPages(0);
        setIsLoading(false);
        return;
      }

      const url = `https://api.github.com/search/repositories?q=${searchTerm}&page=${page}`;

      try {
        const response = await fetch(url);
        const data: SearchResponse = await response.json();
        if (data.items?.length === 0) {
          setPage(0);
        }
        setSearchResults(data.items);
        setTotalPages(Math.ceil(data.total_count / 30));
        setIsLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    const timeoutId = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, page]);

  return (
    <>
      <div
        className={`search-control ${
          searchTerm.trim().length > 0 ? "sticky" : ""
        }`}
      >
        <input
          type="text"
          placeholder="Search for a repository"
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        {!isLoading && (
          <div>
            <ul className={searchResults.length > 0 ? "show" : ""}>
              {searchResults.map((result) => (
                <li key={result.id}>
                  <a href={result.html_url} target="_blank" rel="noreferrer">
                    {result.full_name} <span>{result.description}</span>
                  </a>
                </li>
              ))}
            </ul>

            {page !== 0 && (
              <div className="footer">
                {page > 1 && (
                  <button onClick={() => handlePageChange(page - 1)}>
                    Prev
                  </button>
                )}
                {<span>{page}</span>}

                {page < totalPages && (
                  <button onClick={() => handlePageChange(page + 1)}>
                    Next
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {isLoading && <p>Loading...</p>}
      </div>
    </>
  );
}

export default Search;

const SearchInput = () => {
  return (
    <div className="relative flex items-center w-44">
      <input
        type="text"
        name="search"
        id="search"
        placeholder="Search"
        className="block w-full py-1 pr-16 text-sm leading-6 text-gray-900 border-0 rounded shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 placeholder:text-xs bg-gray-50"
      />

      <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
        <kbd className="inline-flex items-center px-1 font-sans text-xs text-gray-400 border border-gray-200 rounded">
          ⌘K
        </kbd>
      </div>
    </div>
  );
};

export default SearchInput;

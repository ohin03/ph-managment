import React, { useState } from "react";
import { searchMedicine } from "../api/searchApi";

const SearchBar = () => {
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState([]);
  const [index, setIndex] = useState(-1);
  const [selectedId, setSelectedId] = useState("");

  const handleChange = async (e) => {
    const value = e.target.value;
    setSearchText(value);

    if (!value.trim()) {
      setData([]);
      setIndex(-1);
      return;
    }

    const result = await searchMedicine(value);
    console.log("Search query:", value);
    console.log("Search result:", result);
    setData(result);
    setIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setIndex((prev) => Math.min(prev + 1, data.length - 1));
    }

    if (e.key === "ArrowUp") {
      setIndex((prev) => Math.max(prev - 1, 0));
    }

    if (e.key === "Enter" && data[index]) {
      setSelectedId(data[index]._id);
    }
  };

  const handleClick = (id) => {
    setSelectedId(id);
  };

  return (
    <div>
      <input
        type="text"
        value={searchText}
        placeholder="Type medicine name"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        style={{
          width: "100%",
          padding: "8px",
          fontSize: "16px",
        }}
      />

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          marginTop: "5px",
        }}
      >
        {data.map((item, i) => (
          <li
            key={item._id}
            onClick={() => handleClick(item._id)}
            style={{
              padding: "5px",
              background: i === index ? "#ddd" : "transparent",
              cursor: "pointer",
            }}
          >
            {item.name || item.item_name}
          </li>
        ))}
      </ul>

      <input
        type="text"
        value={selectedId}
        readOnly
        placeholder="Selected ID"
        style={{
          width: "100%",
          padding: "8px",
          marginTop: "10px",
          fontSize: "16px",
        }}
      />
    </div>
  );
};

export default SearchBar;

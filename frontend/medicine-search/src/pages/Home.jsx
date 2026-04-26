import React from "react";
import SearchBar from "../components/SearchBar";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-wrapper">
      <h3>Search Medicine</h3>
      <SearchBar />
    </div>
  );
};

export default Home;
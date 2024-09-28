// src/App.js
import React, { useState } from 'react';
import GanttChart from './components/GanttChart';
import { Container } from 'react-bootstrap';
import './App.css';

const App = () => {
  const [filter, setFilter] = useState({ year: new Date().getFullYear() });

  const handleFilterChange = (name, value) => {
    setFilter((prevFilter) => ({
      ...prevFilter,
      [name]: value,
    }));
  };

  return (
      <Container>
        <div className="mt-4">
          <GanttChart />
        </div>
      </Container>
  );
};

export default App;

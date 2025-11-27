import { useEffect } from "react";

export default function TestAPI() {
  useEffect(() => {
    fetch("http://localhost:5000/properties")  
      .then((res) => res.json())
      .then((data) => console.log("Backend Response:", data))
      .catch((err) => console.error("API Error:", err));
  }, []);

  return <h1>Testing API… Check Console</h1>;
}

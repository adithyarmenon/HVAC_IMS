import { useEffect } from "react";
import API from "./api";

function App() {

  useEffect(() => {
    API.get("/health")
      .then(res => {
        console.log("Backend connected:", res.data);
      })
      .catch(err => {
        console.error("Backend connection failed:", err);
      });
  }, []);

  return <h1>HVAC IMS Frontend</h1>;
}

export default App;

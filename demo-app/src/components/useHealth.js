import { useEffect, useState } from "react";

export const useHealth = (url) => {
  const [health, setHealth] = useState({ loading: true });

  useEffect(() => {
    try {
      fetch(url)
        .then((res) => res.json())
        .then((y) => {
          console.log(y);
          setHealth({ loading: false });
        });
    } catch (error) {
      setHealth({ loading: true });
      console.log("an error has occurred");
      console.log(error);
    }
  }, [url, health.loading]);

  return health;
};

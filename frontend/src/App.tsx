import { useState } from "react";
import "./App.css";
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

function App() {
  const [user, setUser] = useState<string>();

  auth.onAuthStateChanged((user) => {
    setUser(user?.uid);
  });

  const login = async (token: string) => {
    try {
      const response = await fetch("http://localhost:4000/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(result);
      return result;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const handleClick = async () => {
    const result = await signInWithEmailAndPassword(
      auth,
      "m@mpow.dev",
      "TestTest2"
    );
    const token = await result.user.getIdToken();
    await login(token);
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>SimpleFi</p>
        {user ? <p>{user}</p> : <p>not logged in</p>}

        {user ? (
          <button
            onClick={() => {
              auth.signOut();
            }}
          >
            logout
          </button>
        ) : (
          <button onClick={handleClick}>log in</button>
        )}
      </header>
    </div>
  );
}

export default App;

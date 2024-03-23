import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Reset from "./Reset";
import ToDo from "./Todo";
import Profile from "./Profile";

function App() {
  return (
    <div className="app">
      <Router>
        <Routes>
          <Route exact path="/" Component={Login} />
          <Route exact path="/Register" Component={Register} />
          <Route exact path="/reset" Component={Reset} />
          <Route exact path="/todo" Component={ToDo} />
          <Route exact path="/profile" Component={Profile} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

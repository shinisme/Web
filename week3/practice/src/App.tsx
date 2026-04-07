// src/App.tsx
import { Link } from './Link';
import { Routes } from './Routes';
import { Route } from './Route';

const SeunguriPage = () => <h1>승구리 페이지</h1>;
const SSPage = () => <h1>승승 페이지</h1>;
const HappyPage = () => <h1>해피 페이지</h1>;
const NotFound = () => <h1>404 - 여기는 아무것도 없어요!</h1>;

function App() {
  return (
    <div>
      <nav>
        <Link to="/seunguri">승구리</Link>
        <Link to="/ss">승승</Link>
        <Link to="/happy">해피</Link>
        <Link to="/not-found">NOT FOUND</Link>
      </nav>
      <hr />
      
      {/* switch 문 대신 이렇게 작성합니다. 훨씬 읽기 편하죠? */}
      <Routes>
        <Route path="/seunguri" component={SeunguriPage} />
        <Route path="/ss" component={SSPage} />
        <Route path="/happy" component={HappyPage} />
        <Route path="/not-found" component={NotFound} />
        <Route path="/" component={() => <h1>메인 화면입니다!</h1>} />
      </Routes>
    </div>
  );
}

export default App;
import Link from "next/link";

const Nav = () => {
  return (
    <>
      <li>
        <Link href="/">Home</Link>
      </li>
      <h3>-- Computer Science --</h3>
      <li>
        <Link href="/ChatRoom?class=Computer-Science&diflevel=beginner">Beginner</Link>
      </li>
      <li>
        <Link href="/ChatRoom?class=Computer-Science&diflevel=intermediate">Intermediate</Link>
      </li>
      <li>
        <Link href="/ChatRoom?class=Computer-Science&diflevel=advanced">Advanced</Link>
      </li>
      <h3>-- Geography --</h3>
      <li>
        <Link href="/ChatRoom?class=Geography&diflevel=beginner">Beginner</Link>
      </li>
      <li>
        <Link href="/ChatRoom?class=Geography&diflevel=intermediate">Intermediate</Link>
      </li>
      <li>
        <Link href="/ChatRoom?class=Geography&diflevel=advanced">Advanced</Link>
      </li>
      <h3>-- History --</h3>
      <li>
        <Link href="/ChatRoom?class=History&diflevel=beginner">Beginner</Link>
      </li>
      <li>
        <Link href="/ChatRoom?class=History&diflevel=intermediate">Intermediate</Link>
      </li>
      <li>
        <Link href="/ChatRoom?class=History&diflevel=advanced">Advanced</Link>
      </li>
    </>
  );
};

export default Nav;

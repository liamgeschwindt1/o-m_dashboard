/**
 * StudioPage — wraps the existing App wizard inside the /studio route.
 * The App component handles its own full-screen layout so we just render it directly.
 */
import App from "../App";

export default function StudioPage() {
  return <App />;
}

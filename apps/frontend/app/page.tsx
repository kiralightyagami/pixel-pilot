import { Appbar } from "../components/Appbar";
import { Prompt } from "../components/prompt";

export default function Home() {
  return (
    <div className="">
      <Appbar />
      <div className="p-4">
        <Prompt />
      </div>
    </div>
  );
}

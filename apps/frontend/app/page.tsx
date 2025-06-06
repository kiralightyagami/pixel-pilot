import { Appbar } from "../components/Appbar";
import { Prompt } from "../components/prompt";

export default function Home() {
  return (
    <div className="pt-4">
      <Appbar />
      <div className="max-w-2xl mx-auto pt-32">
        <div className="text-2xl font-bold text-center">
          What do you want to generate?
        </div>
        <div className="text-sm text-muted-foreground text-center pt-2">
          Generate Text to Video with Pixel Pilot
        </div>
        <div className="p-4 ">
        <Prompt />
        </div>
      </div>
    </div>
  );
}

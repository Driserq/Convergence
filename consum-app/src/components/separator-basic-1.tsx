import { Separator } from "./ui/separator";

export const title = "Horizontal Separator";

const SeparatorBasic1 = () => (
  <div className="space-y-4">
    <p className="text-sm">Above the separator</p>
    <Separator />
    <p className="text-sm">Below the separator</p>
  </div>
);

export default SeparatorBasic1;

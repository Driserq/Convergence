import { ArrowRight } from "lucide-react";

import { Button } from "./ui/button";

export const title = "Button with Right Icon";

const ButtonStandard3 = () => (
  <Button className="gap-2">
    Button
    <ArrowRight className="size-4" />
  </Button>
);

export default ButtonStandard3;

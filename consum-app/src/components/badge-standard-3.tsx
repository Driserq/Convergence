import { Star } from "lucide-react";

import { Badge } from "./ui/badge";

export const title = "Badge with Icon on Left";

const BadgeStandard3 = () => (
  <Badge>
    <Star className="mr-1 size-3" />
    Badge
  </Badge>
);

export default BadgeStandard3;

import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

export const title = "Standard Card";

const CardStandard1 = () => (
  <Card className="w-[350px]">
    <CardHeader>
      <CardTitle>Card Title</CardTitle>
      <CardDescription>Card description goes here</CardDescription>
    </CardHeader>
    <CardContent>
      <p>This is the card content area where you can place any content.</p>
    </CardContent>
    <CardFooter className="flex justify-between">
      <Button variant="outline">Cancel</Button>
      <Button>Submit</Button>
    </CardFooter>
  </Card>
);

export default CardStandard1;

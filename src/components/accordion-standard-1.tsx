import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

export const title = "Standard";

const data = [
  {
    value: "item-1",
    title: "Accordion Trigger",
    content: "Use this layout for compact FAQ or content toggles."
  },
  {
    value: "item-2",
    title: "Accessible by Default",
    content: "Each trigger is keyboard navigable and communicates expanded state."
  },
  {
    value: "item-3",
    title: "Customizable",
    content: "Swap content or add icons while preserving the base pattern structure."
  }
];

const AccordionStandard1 = () => (
  <Accordion
    className="-space-y-px w-full max-w-md"
    collapsible
    defaultValue={data[0].value}
    type="single"
  >
    {data.map((item) => (
      <AccordionItem
        className="overflow-hidden border bg-background px-4 first:rounded-t-lg last:rounded-b-lg last:border-b"
        key={item.value}
        value={item.value}
      >
        <AccordionTrigger>{item.title}</AccordionTrigger>
        <AccordionContent>
          <p className="text-muted-foreground">{item.content}</p>
        </AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);

export default AccordionStandard1;

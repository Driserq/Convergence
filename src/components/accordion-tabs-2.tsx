import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

export const title = "Tabs";

const data: { value: string; title: string; content: string }[] = [
  {
    value: "tab-1",
    title: "Capture",
    content: "Save any video or article and instantly generate a structured blueprint."
  },
  {
    value: "tab-2",
    title: "Refine",
    content: "Customize the plan with additional steps, reminders, or supporting resources."
  },
  {
    value: "tab-3",
    title: "Execute",
    content: "Track progress with habit loops, templates, and scheduled nudges."
  },
  {
    value: "tab-4",
    title: "Review",
    content: "Summaries help you reflect on wins, misses, and next changes to implement."
  }
];

const AccordionTabs2 = () => (
  <Accordion
    className="flex w-full max-w-md flex-col gap-2"
    collapsible
    defaultValue={data[0].value}
    type="single"
  >
    {data.map((item) => (
      <AccordionItem
        className="overflow-hidden rounded-lg border bg-background px-4 last:border-b"
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

export default AccordionTabs2;

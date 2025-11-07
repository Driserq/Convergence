import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

export const title = "Multi-level";

const items = [
  {
    id: "multi-1",
    title: "Automation",
    sections: [
      {
        id: "multi-1-a",
        title: "Blueprint Generation",
        description: "Map how Convergence turns long-form content into actionable steps."
      },
      {
        id: "multi-1-b",
        title: "Follow-Up Nudges",
        description: "Explain reminders that keep users on track after the blueprint is created."
      }
    ]
  },
  {
    id: "multi-2",
    title: "Collaboration",
    sections: [
      {
        id: "multi-2-a",
        title: "Shared Libraries",
        description: "Show how teams can reuse habits and blueprints across projects."
      },
      {
        id: "multi-2-b",
        title: "Progress Visibility",
        description: "Outline reporting patterns that highlight what has been completed."
      }
    ]
  }
];

const AccordionMultiLevel1 = () => (
  <Accordion
    className="-space-y-1 w-full max-w-md"
    collapsible
    defaultValue={items[0].id}
    type="single"
  >
    {items.map((item) => (
      <AccordionItem
        className="overflow-hidden border bg-background first:rounded-t-lg last:rounded-b-lg last:border-b"
        key={item.id}
        value={item.id}
      >
        <AccordionTrigger className="px-4 py-3 text-left hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="space-y-2 bg-muted/40 p-4">
          {item.sections.map((section) => (
            <div
              key={section.id}
              className="rounded-xl border border-border/60 bg-background/90 p-4"
            >
              <p className="font-medium">{section.title}</p>
              <p className="text-sm text-muted-foreground">{section.description}</p>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);

export default AccordionMultiLevel1;

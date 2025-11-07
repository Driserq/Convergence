import { FileText, Folder, Settings, Users } from "lucide-react";
import type { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

export const title = "Subtitle with Left Icon";

const icons = [FileText, Folder, Settings, Users];

const data: {
  value: string;
  title: string;
  subtitle: string;
  content: string;
  icon: ReactNode;
}[] = icons.map((Icon, index) => ({
  value: `section-${index + 1}`,
  title: [
    "Capture Key Insights",
    "Organize Playbooks",
    "Tune Habit Systems",
    "Collaborate With Teams"
  ][index],
  subtitle: [
    "Turn ideas into ready-to-use steps",
    "Keep every blueprint in one place",
    "Adjust routines as needs change",
    "Share progress and accountability"
  ][index],
  content: [
    "Summaries highlight the exact actions you should take so you never lose the core lesson.",
    "Build collections of blueprints grouped by goal, topic, or team to make retrieval effortless.",
    "Review suggestions to adapt daily habits or emergency actions without rebuilding from scratch.",
    "Invite collaborators to comment, refine, and ship improvements faster than solo work."
  ][index],
  icon: <Icon className="size-4 text-muted-foreground" />
}));

const AccordionSubtitle2 = () => (
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
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3">
            {item.icon}
            <div className="flex flex-col items-start text-left">
              <span>{item.title}</span>
              <span className="text-muted-foreground text-sm">
                {item.subtitle}
              </span>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="ps-7">
          <p className="text-muted-foreground">{item.content}</p>
        </AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);

export default AccordionSubtitle2;

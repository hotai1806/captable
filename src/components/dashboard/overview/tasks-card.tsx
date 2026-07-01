import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { RiCheckboxCircleFill } from "@remixicon/react";
import Link from "next/link";

export type Task = {
  id: string;
  title: string;
  description: string;
  href: string;
  completed: boolean;
};

type Props = {
  publicId: string;
  tasks: Task[];
};

const TasksCard = ({ publicId, tasks }: Props) => {
  const remaining = tasks.filter((task) => !task.completed).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <CardDescription className="text-md font-semibold text-primary">
          Your tasks
        </CardDescription>

        {remaining === 0 ? (
          <span className="text-xs font-medium text-emerald-600">
            All caught up
          </span>
        ) : (
          <span className="text-xs font-medium text-muted-foreground">
            {remaining} remaining
          </span>
        )}
      </CardHeader>

      <CardContent>
        {remaining === 0 ? (
          <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
            <RiCheckboxCircleFill className="h-5 w-5 text-emerald-500" />
            You{`'`}re all caught up. New tasks will show up here as they come
            in.
          </div>
        ) : (
          <ul className="divide-y">
            {tasks.map((task) => (
              <li key={task.id} className="py-3 first:pt-0 last:pb-0">
                <Link
                  href={`/${publicId}${task.href}`}
                  className="group flex items-start gap-3"
                >
                  <Checkbox
                    checked={task.completed}
                    disabled
                    className="mt-0.5 cursor-pointer"
                  />
                  <div>
                    <p
                      className={cn(
                        "text-sm font-medium",
                        task.completed
                          ? "text-muted-foreground line-through"
                          : "text-primary group-hover:underline",
                      )}
                    >
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {task.description}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default TasksCard;

import { Card, CardContent } from "@/components/ui/card";
import {
  RiFileTextLine,
  RiLineChartLine,
  RiShieldCheckLine,
} from "@remixicon/react";
import Link from "next/link";

type Recommendation = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  cta: string;
};

type Props = {
  publicId: string;
};

const recommendations: Recommendation[] = [
  {
    id: "409a",
    icon: RiLineChartLine,
    title: "Get a 409A valuation",
    description:
      "An up-to-date 409A helps you set a defensible strike price for new option grants.",
    href: "/409a",
    cta: "Start a valuation",
  },
  {
    id: "3921",
    icon: RiFileTextLine,
    title: "File your Form 3921",
    description:
      "Report ISO exercises to the IRS and your employees before the January deadline.",
    href: "/3921",
    cta: "View Form 3921",
  },
  {
    id: "esign",
    icon: RiShieldCheckLine,
    title: "Keep paperwork signed",
    description:
      "Send offer letters, SAFEs, and stock agreements out for e-signature in minutes.",
    href: "/documents/esign",
    cta: "Send a document",
  },
];

const RecommendationsCard = ({ publicId }: Props) => {
  return (
    <section>
      <h4 className="font-medium">Recommendations</h4>
      <p className="text-sm text-muted-foreground">
        Helpful tools and reminders to keep your cap table healthy
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map(
          ({ id, icon: Icon, title, description, href, cta }) => (
            <Card key={id}>
              <CardContent className="flex h-full flex-col gap-3 pt-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100">
                  <Icon className="h-5 w-5 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary">{title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {description}
                  </p>
                </div>
                <Link
                  href={`/${publicId}${href}`}
                  className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                >
                  {cta} &rarr;
                </Link>
              </CardContent>
            </Card>
          ),
        )}
      </div>
    </section>
  );
};

export default RecommendationsCard;

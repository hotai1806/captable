"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { ScrollArea } from "@/components/ui/scroll-area";
import { DonutChart } from "@tremor/react";
import { Fragment, useEffect, useState } from "react";
import DonutSelector from "./donut-selector";

type DonutTooltipProps = {
  name: string;
  value: number;
};

export type OwnershipBucket = {
  key: string;
  value: number;
};

type Props = {
  stakeholderBreakdown: OwnershipBucket[];
  shareClassBreakdown: OwnershipBucket[];
};

const DonutCard = ({ stakeholderBreakdown, shareClassBreakdown }: Props) => {
  const [isClient, setIsClient] = useState(false);
  const [selected, setSelected] = useState("stakeholder");

  useEffect(() => {
    setIsClient(true);
  }, []);

  const data =
    selected === "stakeholder" ? stakeholderBreakdown : shareClassBreakdown;

  return (
    <Fragment>
      {isClient && (
        <Card className="h-[365px]">
          <CardHeader>
            <div className="text-sm text-gray-700">
              <div className="flex">
                <span>Ownership by</span>
                <DonutSelector selected={selected} onChange={setSelected} />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {data.length ? (
              <div className="grid grid-cols-2 gap-4">
                <ScrollArea className="h-60 w-full py-4 pr-8">
                  <ul className="space-y-3 text-sm">
                    {data.map((item) => (
                      <li key={item.key} className="flex justify-between">
                        <span className="font-medium">{item.key}</span>
                        <span>{item.value}%</span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>

                <DonutChart
                  className="h-60 py-4"
                  data={data}
                  category="value"
                  index="key"
                  showLabel={false}
                  showAnimation={true}
                  customTooltip={({ payload }) => {
                    if (Array.isArray(payload) && payload.length > 0) {
                      const data = payload[0] as DonutTooltipProps;

                      return (
                        <div className="rounded bg-white p-2 shadow-md">
                          <p className="text-xs text-primary/80">
                            <span className="font-semibold">{data.name}</span>:{" "}
                            {data.value}%
                          </p>
                        </div>
                      );
                    }

                    return null;
                  }}
                />
              </div>
            ) : (
              <div className="flex h-60 items-center justify-center text-center text-sm text-muted-foreground">
                Issue shares or options to see an ownership breakdown here.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </Fragment>
  );
};

export default DonutCard;

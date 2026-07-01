import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

const formatter = new Intl.NumberFormat("en-US");
const currencyFormatter = new Intl.NumberFormat("en-US");

export type SummaryTableShareClass = {
  id: string;
  name: string;
  authorizedShares: number;
  dilutedShares: number;
  ownership: number;
  raised: number;
};

type Props = {
  shareClasses: SummaryTableShareClass[];
  totalRaised: number;
};

const SummaryTable = ({ shareClasses, totalRaised }: Props) => {
  const raisedAcrossShareClasses = shareClasses.reduce(
    (sum, klass) => sum + klass.raised,
    0,
  );
  const hasUnallocatedCapital = totalRaised > raisedAcrossShareClasses;

  if (!shareClasses.length) {
    return (
      <Card className="mt-4">
        <div className="p-6">
          <Alert>
            <AlertDescription>
              You haven{`'`}t created any share classes yet. Once you do, you
              {`'`}ll see a breakdown of authorized, diluted, and raised amounts
              here.
            </AlertDescription>
          </Alert>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <Table className="">
        <TableHeader>
          <TableRow>
            <TableHead>Share class</TableHead>
            <TableHead>Authorized shares</TableHead>
            <TableHead>Diluted shares</TableHead>
            <TableHead>Ownership</TableHead>
            <TableHead className="text-right">Amount raised</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shareClasses.map((klass) => (
            <TableRow key={klass.id} className="border-none">
              <TableCell className="font-medium">{klass.name}</TableCell>
              <TableCell>{formatter.format(klass.authorizedShares)}</TableCell>
              <TableCell>{formatter.format(klass.dilutedShares)}</TableCell>
              <TableCell>{formatter.format(klass.ownership)} %</TableCell>
              <TableCell className="text-right">
                $ {currencyFormatter.format(klass.raised)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}>Total</TableCell>
            <TableCell className="text-right">
              $ {currencyFormatter.format(totalRaised)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      {hasUnallocatedCapital && (
        <p className="border-t px-4 py-3 text-xs text-muted-foreground">
          The total includes capital raised through SAFEs and convertible notes
          that haven{`'`}t converted into a share class yet.
        </p>
      )}
    </Card>
  );
};

export default SummaryTable;

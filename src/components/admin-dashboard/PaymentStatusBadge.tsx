import { Badge } from "@/components/ui/badge";

interface Props {
  hasPaid: boolean;
}

export const PaymentStatusBadge = ({ hasPaid }: Props) => {
  return (
    <Badge variant={hasPaid ? "default" : "destructive"}>
      {hasPaid ? "Paid ✅" : "Pending ❌"}
    </Badge>
  );
};

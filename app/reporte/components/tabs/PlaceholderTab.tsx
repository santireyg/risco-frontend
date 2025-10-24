import { Card, CardBody } from "@heroui/card";
import { Construction } from "lucide-react";

interface PlaceholderTabProps {
  title: string;
  description: string;
}

export default function PlaceholderTab({
  title,
  description,
}: PlaceholderTabProps) {
  return (
    <Card className="max-w-2xl mx-auto border border-gray-200" shadow="md">
      <CardBody className="flex flex-col items-center justify-center py-20 px-4">
        <div className="bg-gray-50 rounded-full p-6 mb-6">
          <Construction className="w-16 h-16 text-gray-400" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">{title}</h2>
        <p className="text-gray-600 text-center max-w-md">{description}</p>
      </CardBody>
    </Card>
  );
}

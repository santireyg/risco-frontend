import { Card, CardBody } from "@heroui/card";
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

import { AIKeyInsights } from "../../../types";

interface KeyInsightsProps {
  insights: AIKeyInsights;
}

type InsightType = "strengths" | "watchouts" | "red_flags";

const getInsightIcon = (type: InsightType) => {
  switch (type) {
    case "red_flags":
      return <AlertCircle className="w-4 h-4 text-danger" />;
    case "watchouts":
      return <AlertTriangle className="w-4 h-4 text-warning" />;
    case "strengths":
      return <CheckCircle className="w-4 h-4 text-success" />;
  }
};

const getInsightBorderColor = (type: InsightType) => {
  switch (type) {
    case "red_flags":
      return "border-l-danger/60";
    case "watchouts":
      return "border-l-warning/60";
    case "strengths":
      return "border-l-success/60";
  }
};

const getInsightBgColor = (type: InsightType) => {
  switch (type) {
    case "red_flags":
      return "bg-danger/5 hover:bg-danger/10";
    case "watchouts":
      return "bg-warning/5 hover:bg-warning/10";
    case "strengths":
      return "bg-success/5 hover:bg-success/10";
  }
};

export default function KeyInsights({ insights }: KeyInsightsProps) {
  // Build flat list with type information
  const allInsights: Array<{ type: InsightType; content: string }> = [
    ...insights.strengths.map((content) => ({
      type: "strengths" as InsightType,
      content,
    })),
    ...insights.watchouts.map((content) => ({
      type: "watchouts" as InsightType,
      content,
    })),
    ...insights.red_flags.map((content) => ({
      type: "red_flags" as InsightType,
      content,
    })),
  ];

  return (
    <Card className="border border-slate-200 shadow-sm" radius="sm" shadow="none">
      <CardBody className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Key Insights</h2>
        <div className="space-y-2.5">
          {allInsights.map((insight, index) => (
            <div
              key={index}
              className={`flex gap-2.5 p-3 border-l-3 rounded-r transition-colors ${getInsightBorderColor(
                insight.type
              )} ${getInsightBgColor(insight.type)} border border-gray-100`}>
              <div className="flex-shrink-0 mt-0.5">{getInsightIcon(insight.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="prose prose-sm max-w-none text-gray-700 [&_p]:text-xs [&_p]:leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:text-xs [&_ol]:list-decimal [&_ol]:ml-4 [&_ol]:text-xs [&_li]:mb-1 [&_li]:pl-1">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                    {insight.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

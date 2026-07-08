import { PageTransition } from "../../../../components/page-transition";
import { LiveReportView } from "../../../../components/report/live-report-view";
import { demoReport } from "../../../../lib/demo-report";

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
  const resolvedParams = await params;
  const interviewId = resolvedParams.id;

  return (
    <PageTransition state="result">
      <LiveReportView interviewId={interviewId} fallbackReport={demoReport} />
    </PageTransition>
  );
}

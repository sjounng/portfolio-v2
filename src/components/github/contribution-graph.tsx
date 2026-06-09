import type { ContributionDay } from "@/lib/github";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function ContributionGraph({
  weeks,
  total,
}: {
  weeks: ContributionDay[][];
  total: number;
}) {
  // 각 주(열) 첫 날의 월이 바뀌는 지점에 라벨 표시
  const monthLabels = weeks.map((week, i) => {
    const first = week[0];
    if (!first) return "";
    const month = new Date(first.date).getMonth();
    const prevMonth = i > 0 && weeks[i - 1][0] ? new Date(weeks[i - 1][0].date).getMonth() : -1;
    return month !== prevMonth ? MONTHS[month] : "";
  });

  return (
    <div className="rounded-lg border border-border p-4">
      <p className="mb-3 text-sm text-muted">
        지난 1년간 <span className="font-semibold text-foreground">{total}</span>회 기여
      </p>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1">
          {/* 월 라벨 */}
          <div className="flex gap-[3px] pl-1 text-[10px] text-muted">
            {monthLabels.map((label, i) => (
              <div key={i} className="w-[11px] shrink-0">
                {label}
              </div>
            ))}
          </div>

          {/* 잔디 격자 */}
          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day) => (
                  <div
                    key={day.date}
                    className="gh-cell h-[11px] w-[11px] rounded-sm"
                    data-level={day.level}
                    title={`${day.date}: ${day.count} contributions`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 범례 */}
      <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-muted">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <div key={l} className="gh-cell h-[11px] w-[11px] rounded-sm" data-level={l} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

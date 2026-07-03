import type { ContributionDay } from "@/lib/github";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function ContributionGraph({
  weeks,
  total,
}: {
  weeks: ContributionDay[][];
  total: number;
}) {
  // 각 주(열) 첫 날의 월이 바뀌는 지점에 라벨 표시.
  // 연초·연말의 잘린 달(1~2열)은 라벨을 생략해 이웃 라벨과 겹치지 않게 한다.
  const monthOf = (i: number) => {
    const first = weeks[i]?.[0];
    return first ? new Date(first.date).getMonth() : -1;
  };
  const monthLabels = weeks.map((_, i) => {
    const month = monthOf(i);
    if (month === -1) return "";
    const prevMonth = i > 0 ? monthOf(i - 1) : -1;
    if (month === prevMonth) return "";
    // 이 달이 최소 3열 이상 이어질 때만 표시
    if (monthOf(i + 1) !== month || monthOf(i + 2) !== month) return "";
    return MONTHS[month];
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
              <div key={i} className="w-[11px] shrink-0 whitespace-nowrap">
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

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ClipboardCheck } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { testService } from "@/services/testService";

export default function FullTestList() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    testService
      .list({ type: "full", limit: 50 })
      .then((res) => {
        if (!cancelled) setTests(res.data.items);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Không tải được danh sách");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppLayout>
      <div className="px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold mb-2">
            Tổng hợp đề thi
          </h1>
          <p className="text-slate-600">
            Đề thi mô phỏng đầy đủ định dạng TOEIC Listening & Reading: 200 câu,
            120 phút. Hãy chuẩn bị tai nghe và không gian yên tĩnh để bắt đầu
            thi.
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Đang tải...
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3">
            {error}
          </div>
        )}

        {!loading && !error && tests.length === 0 && (
          <EmptyState
            icon={ClipboardCheck}
            title="Chưa có đề thi nào"
            description="Quay lại sau khi admin thêm đề mới."
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tests.map((t) => (
            <Link key={t._id} to={`/tests/${t._id}`} className="block group">
              <Card className="hover:shadow-elevated transition-shadow h-full relative overflow-hidden">
                {/* Badge Free góc trên phải */}
                <Badge
                  variant="tertiary"
                  className="absolute top-3 right-3 z-10"
                >
                  Free
                </Badge>

                <CardContent className="p-6">
                  <h3 className="font-heading font-bold text-lg text-slate-900 mb-4 pr-14 group-hover:text-primary-600 transition-colors">
                    {t.title}
                  </h3>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-slate-600 mb-4">
                    <div>
                      Thời gian:{" "}
                      <strong className="text-slate-900">
                        {t.durationMinutes} phút
                      </strong>
                    </div>
                    <div>
                      Câu hỏi:{" "}
                      <strong className="text-slate-900">
                        {t.totalQuestions} câu
                      </strong>
                    </div>
                    <div>
                      Phần thi:{" "}
                      <strong className="text-slate-900">7 phần</strong>
                    </div>
                    <div>
                      Điểm tối đa:{" "}
                      <strong className="text-slate-900">990 điểm</strong>
                    </div>
                  </div>

                  {t.series && (
                    <Badge variant="muted" className="mb-4">
                      {t.series.toUpperCase()}
                    </Badge>
                  )}

                  <div>
                    <span className="inline-flex items-center justify-center px-5 py-2 bg-primary-500 text-white text-sm font-medium rounded-full group-hover:bg-primary-600 transition-colors">
                      Làm bài
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

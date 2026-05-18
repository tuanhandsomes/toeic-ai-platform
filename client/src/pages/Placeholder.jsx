import AppLayout from '../components/layout/AppLayout.jsx';
import { Construction } from 'lucide-react';

export default function Placeholder({ title }) {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="card text-center">
          <Construction className="w-12 h-12 text-primary-500 mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold mb-2">{title}</h1>
          <p className="text-slate-600">
            Trang này đang trong quá trình hoàn thiện. Sẽ được build trong các ngày tiếp theo của sprint.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

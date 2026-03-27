import { createFileRoute } from '@tanstack/react-router';

import { AISummary } from '@/components/AISummary';
import Header from '@/components/Header';
import IssuedWarningsAndWatches from '@/components/IssuedWarningsAndWatches';
import SevereWeatherOutlook from '@/components/SevereWeatherOutlook';
import ThunderstormOutlook from '@/components/ThunderstormOutlook';
import { Toaster } from '@/components/ui/sonner';

export const Route = createFileRoute('/')({ component: App });

function App() {
  return (
    <div className="flex flex-col h-dvh w-full overscroll-none">
      <Header />
      <main className="flex flex-1 m-2 gap-3 min-h-0">
        <Toaster position="top-center" offset={6} />
        <div className="flex-1">
          <AISummary />
        </div>
        <div className="w-90">
          <IssuedWarningsAndWatches />
        </div>
        <div className="w-[30%]  min-h-full">
          <SevereWeatherOutlook />

          <ThunderstormOutlook />
        </div>
      </main>
      {/* <button
        onClick={() => {
          // toastSuccess('Test Success', 'This is a success message!');
          // toastInfo('Test Success', 'This is a success message!');
          // toastUpdateToDate('Test Update', 'This is an update message!');
          // toastError('Test Error', 'This is an error message!');
        }}
      >
        123
      </button> */}
    </div>
  );
}

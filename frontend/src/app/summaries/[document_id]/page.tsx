// frontend/src/app/summaries/[document_id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useSummaryStore } from '@/lib/store';
import { getSummary, getSummaryStatus } from '@/services/documents';
import { Button } from '@/components/ui/button';
import { createBrowserClient } from '@/utils/supabase';
import type { Session } from '@supabase/supabase-js';

const SummaryDisplayPage = () => {
  const params = useParams();
  const documentId = params.document_id as string;
  const supabase = createBrowserClient();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    getSession();
  }, [supabase]);


  const accessToken = session?.access_token;

  const {
    summaries,
    addSummary,
    setSummaryLoading,
    setSummaryError,
    getSummaryById,
  } = useSummaryStore();

  const [copied, setCopied] = useState(false);

  const summaryData = getSummaryById(documentId);

  useEffect(() => {
    if (!documentId || !accessToken) return;

    const fetchStatus = async () => {
      setSummaryLoading(documentId, true);
      try {
        const statusData = await getSummaryStatus(documentId, accessToken);
        if (statusData.status === 'completed') {
          const summary = await getSummary(documentId, accessToken);
          addSummary(documentId, summary.summary_text);
        } else if (statusData.status === 'failed') {
          setSummaryError(documentId, 'Summary generation failed.');
        } else {
          // If processing, poll again after a delay
          setTimeout(fetchStatus, 5000);
        }
      } catch (error) {
        setSummaryError(documentId, 'Failed to fetch summary status.');
        console.error(error);
      }
    };

    if (!summaryData) {
      fetchStatus();
    }
  }, [documentId, accessToken, summaryData, addSummary, setSummaryLoading, setSummaryError]);

  if (summaryData?.loading) {
    return <div className="flex justify-center items-center h-screen">Loading summary...</div>;
  }

  if (summaryData?.error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{summaryData.error}</div>;
  }

  if (!summaryData?.text) {
    return <div className="flex justify-center items-center h-screen">Summary not available yet or still processing.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Summary</h1>
      <div className="prose lg:prose-xl">
        <ReactMarkdown>{summaryData.text}</ReactMarkdown>
      </div>
      <CopyToClipboard text={summaryData.text} onCopy={() => setCopied(true)}>
        <Button className="mt-4">
          {copied ? 'Copied!' : 'Copy Summary'}
        </Button>
      </CopyToClipboard>
    </div>
  );
};

export default SummaryDisplayPage;

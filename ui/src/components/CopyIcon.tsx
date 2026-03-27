import { useCopyToClipboard } from '@/hooks';
import { FaRegCopy } from 'react-icons/fa';
import { toast } from 'sonner';

export function CopyIcon({ content }: { content: string }) {
  const [copy] = useCopyToClipboard();

  const onClick = () => {
    copy(content);
    toast.success('Copied to clipboard');
  };

  return (
    <FaRegCopy
      className="inline-flex text-gray-300 cursor-pointer hover:text-gray-600"
      onClick={onClick}
      size={13}
    />
  );
}

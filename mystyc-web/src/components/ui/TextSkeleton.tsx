import { ReactNode } from 'react';
import clsx from 'clsx';

interface TextSkeletonProps {
  height?: string;
  lines?: number;
  className?: string;
  as?: 'p' | 'span' | 'div';
}

const TextSkeleton = ({ height = '0.75em', lines = 1, as = 'p' }: TextSkeletonProps) => {
  const skeletonLines = Array.from({ length: lines }, (_, index) => {
    // Make last line shorter for realistic look
    const isLastLine = index === lines - 1 && lines > 1;
    const width = isLastLine ? 'w-3/4' : 'w-full';
    
    // Use span for inline contexts (p, span), div for block contexts
    const SkeletonElement = as === 'div' ? 'div' : 'span';
    
    return (
      <SkeletonElement
        key={index}
        style={{ height: height }}
        className={clsx(
          'bg-gray-200 rounded animate-pulse inline-block',
          width,
          lines > 1 && index < lines - 1 && (as === 'div' ? 'mb-2' : 'mr-1') // Spacing between lines
        )}
      />
    );
  });

  // For multiple lines in inline context, add line breaks
  if (lines > 1 && as !== 'div') {
    const linesWithBreaks: ReactNode[] = [];
    skeletonLines.forEach((line, index) => {
      linesWithBreaks.push(line);
      if (index < skeletonLines.length - 1) {
        linesWithBreaks.push(<br key={`br-${index}`} />);
      }
    });
    return <>{linesWithBreaks}</>;
  }

  return (
    <>
      {skeletonLines}
    </>
  );
};

export default TextSkeleton;
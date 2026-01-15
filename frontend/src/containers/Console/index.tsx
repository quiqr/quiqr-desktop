import { useEffect, useRef } from 'react';
import { useConsole } from '../../contexts/ConsoleContext';

const consoleStyle = {
  pre: {
    position: 'fixed' as const,
    right: '0',
    padding: '10px 10px 100px 10px',
    overflow: 'auto' as const,
    margin: '0',
    width: '100%',
    lineHeight: '1.4',
    height: 'calc(100% - 0px)',
    fontFamily: 'monospace',
    fontWeight: 'bold' as const,
    background: '#1E1729',
    color: '#d4d4d4',
    whiteSpace: 'pre-wrap' as const,
    wordWrap: 'break-word' as const,
    zIndex: 3,
  },
};

function ConsoleOutput() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { consoleMessages } = useConsole();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  });

  return (
    <>
      <pre style={consoleStyle.pre}>
        {consoleMessages.map((msg) => msg.line).join('\n')}
        <div ref={scrollRef} />
      </pre>
    </>
  );
}

function Console() {
  return (
    <>
      <ConsoleOutput />
    </>
  );
}

export default Console;

import { useEffect, useRef, useState } from 'react';
import { consoleService } from '../../services/ui-service';

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

function useForceUpdate() {
  const [, setTick] = useState(0);
  return () => setTick((tick) => tick + 1);
}

function ConsoleOutput() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    const listener = { forceUpdate };
    consoleService.registerListener(listener);
    return () => {
      consoleService.unregisterListener(listener);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  });

  return (
    <>
      <pre style={consoleStyle.pre}>
        {consoleService.getConsoleMessages().map((msg) => msg.line).join('\n')}
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

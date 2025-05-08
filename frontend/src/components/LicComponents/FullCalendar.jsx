import React, { useRef, useEffect, useState, useCallback, memo } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { Calendar } from '@fullcalendar/core';
import { CustomRenderingStore } from '@fullcalendar/core/internal';

const reactMajorVersion = parseInt(React.version.split('.')[0]);
const syncRenderingByDefault = reactMajorVersion < 18;

const FullCalendarWrapper = (props) => {
  const elRef = useRef(null);
  const calendarRef = useRef(null);
  const resizeIdRef = useRef(null);
  const [customRenderingMap, setCustomRenderingMap] = useState(new Map());

  const handleCustomRendering = useRef(null);
  const isUnmountingRef = useRef(false);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    isUnmountingRef.current = false;

    const customRenderingStore = new CustomRenderingStore();
    handleCustomRendering.current = customRenderingStore.handle.bind(customRenderingStore);

    const calendar = new Calendar(elRef.current, {
      ...props,
      handleCustomRendering: handleCustomRendering.current,
    });
    calendarRef.current = calendar;
    calendar.render();

    calendar.on('_beforeprint', () => {
      flushSync(() => {});
    });

    let lastRequestTimestamp;

    customRenderingStore.subscribe((map) => {
      const requestTimestamp = Date.now();
      const isMounting = !lastRequestTimestamp;
      const runFunc = (
        syncRenderingByDefault ||
        isMounting ||
        isUpdatingRef.current ||
        isUnmountingRef.current ||
        (requestTimestamp - lastRequestTimestamp) < 100
      ) ? runNow : flushSync;

      runFunc(() => {
        setCustomRenderingMap(map);
        lastRequestTimestamp = requestTimestamp;
        if (isMounting) {
          doResize();
        } else {
          requestResize();
        }
      });
    });

    return () => {
      isUnmountingRef.current = true;
      cancelResize();
      calendar.destroy();
    };
  }, []);

  useEffect(() => {
    isUpdatingRef.current = true;
    calendarRef.current?.resetOptions({
      ...props,
      handleCustomRendering: handleCustomRendering.current,
    });
    isUpdatingRef.current = false;
  }, [props]);

  const requestResize = useCallback(() => {
    if (!isUnmountingRef.current) {
      cancelResize();
      resizeIdRef.current = requestAnimationFrame(() => {
        doResize();
      });
    }
  }, []);

  const doResize = () => {
    calendarRef.current?.updateSize();
  };

  const cancelResize = () => {
    if (resizeIdRef.current !== null) {
      cancelAnimationFrame(resizeIdRef.current);
      resizeIdRef.current = null;
    }
  };

  return (
    <div ref={elRef}>
      {[...customRenderingMap.values()].map((rendering) => (
        <CustomRenderingComponent
          key={rendering.id}
          customRendering={rendering}
        />
      ))}
    </div>
  );
};

const CustomRenderingComponent = memo(({ customRendering }) => {
  const vnode = typeof customRendering.generatorMeta === 'function'
    ? customRendering.generatorMeta(customRendering.renderProps)
    : customRendering.generatorMeta;

  return createPortal(vnode, customRendering.containerEl);
});

function runNow(fn) {
  fn();
}

export default FullCalendarWrapper;

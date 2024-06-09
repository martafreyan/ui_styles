import {
  createElement,
  Fragment,
  cloneElement,
  useMemo,
  useState,
  useRef,
  useEffect
} from 'react';
import { createPortal } from 'react-dom';
import { v4 as uuidv4 } from 'uuid';
import classes from './TooltipBox.module.css';
import { tooltipPlacementCalc } from './TooltipBox.service';

const TooltipInfo = ({ text, id, isOpen, params, refInfo }) => {
  if (!isOpen) return null;

  return createPortal(
    createElement(
      'div',
      {
        id,
        className: classes.container,
        style: params,
        ref: refInfo
      },
      text
    ),
    document.body
  );
};

export const TooltipBox = ({ text, children, placement }) => {
  const [isOpen, setOpen] = useState(false);
  const [params, setParams] = useState({});
  const id = useMemo(() => uuidv4(), []);
  const ref = useRef(null);
  const refInfo = useRef(null);

  const onMouseEnter = (e) => {
    if (refInfo.current?.classList?.contains(classes.fadeEffect)) {
      refInfo.current.classList.remove(classes.fadeEffect);
    } else {
      setOpen(true);
    }
  };

  const onMouseLeave = (e) => {
    if (refInfo.current) refInfo.current.classList.add(classes.fadeEffect);
    setTimeout(() => {
      if (refInfo.current?.classList?.contains(classes.fadeEffect)) {
        setOpen(false);
      }
    }, 400);
  };

  useEffect(() => {
    if (ref.current && refInfo.current && isOpen) {
      const coords = ref.current.getBoundingClientRect();
      const height = !ref.current.offsetHeight
        ? ref.current.getBBox().height
        : ref.current.offsetHeight;
      const width = !ref.current.offsetWidth
        ? ref.current.getBBox().width
        : ref.current.offsetWidth;
      setParams(
        tooltipPlacementCalc(placement, {
          targetHeight: height,
          targetWidth: width,
          targetX: coords?.left,
          targetY: coords?.top + window.scrollY,
          height: refInfo.current.offsetHeight,
          width: refInfo.current.offsetWidth,
          windowWidth: window.innerWidth
        })
      );
    }
  }, [placement, isOpen]);

  if (!text) return children;

  return createElement(
    Fragment,
    null,
    cloneElement(children, {
      onMouseEnter,
      onMouseLeave,
      tooltipid: id,
      ref
    }),
    <TooltipInfo
      id={id}
      isOpen={isOpen}
      text={text}
      params={params}
      refInfo={refInfo}
    />
  );
};

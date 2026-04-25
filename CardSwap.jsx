import React, { Children, cloneElement, forwardRef, isValidElement, useEffect, useRef } from 'react';
import gsap from 'gsap';
import './CardSwap.css';

export const Card = forwardRef(({ customClass, style, children, onClick }, ref) => (
  <div
    ref={ref}
    className={`card ${customClass ?? ''}`.trim()}
    style={style}
    onClick={onClick}
  >
    {children}
  </div>
));
Card.displayName = 'Card';

const makeSlot = (i, distX, distY, total) => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i
});

const placeNow = (el, slot) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true
  });

// Simple, stable CardSwap that uses activeIndex prop
const CardSwap = ({
  cardDistance = 60,
  verticalDistance = 70,
  activeIndex = 0,
  children
}) => {
  const container = useRef(null);
  const cardRefs = useRef([]);
  const currentOrder = useRef(null);
  const isAnimating = useRef(false);
  const tlRef = useRef(null);

  const childArray = Children.toArray(children).filter(isValidElement);
  const count = childArray.length;

  // Initialize positions on first mount
  useEffect(() => {
    if (!container.current) return;
    const els = cardRefs.current;
    if (els.some(el => !el)) return;

    currentOrder.current = Array.from({ length: count }, (_, i) => i);
    els.forEach((el, i) => placeNow(el, makeSlot(i, cardDistance, verticalDistance, count)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  // Animate to activeIndex when it changes
  useEffect(() => {
    if (!container.current || !currentOrder.current) return;
    const els = cardRefs.current;
    if (els.some(el => !el)) return;

    const target = activeIndex;
    const order = [...currentOrder.current];

    // Rotate order so target is first
    let steps = 0;
    while (order[0] !== target && steps < count) {
      order.push(order.shift());
      steps++;
    }
    currentOrder.current = order;

    if (tlRef.current) tlRef.current.kill();
    isAnimating.current = true;

    const tl = gsap.timeline({
      onComplete: () => { isAnimating.current = false; }
    });
    tlRef.current = tl;

    order.forEach((idx, i) => {
      const el = els[idx];
      if (!el) return;
      const slot = makeSlot(i, cardDistance, verticalDistance, count);
      tl.to(el, { x: slot.x, y: slot.y, z: slot.z, zIndex: slot.zIndex, duration: 0.7, ease: 'power2.out' }, 0);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  return (
    <div ref={container} className="card-swap-container">
      {childArray.map((child, i) =>
        cloneElement(child, {
          key: i,
          ref: (el) => { cardRefs.current[i] = el; }
        })
      )}
    </div>
  );
};

export default CardSwap;

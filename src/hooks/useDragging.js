import { useState, useRef, useEffect, useCallback } from 'react';
import { getTimeFromMouseY } from '../utils/timeHelpers';

export const useDragging = (getScheduleForDate, updateScheduleForDate, recalculateDutyBlocks) => {
  const [dragging, setDragging] = useState(null);
  const timelineRefs = useRef({});
  const dragStartPos = useRef(null);

  const handleMouseDown = (dateKey, person, blockId, edge, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const timelineKey = `${person}-${dateKey}`;
    const timelineElement = timelineRefs.current[timelineKey];
    
    if (!timelineElement) return;

    const schedule = getScheduleForDate(dateKey);
    const blocks = person === 'mom' ? schedule.momBlocks : schedule.dadBlocks;
    const currentBlock = blocks.find(b => b.id === blockId);

    if (!currentBlock) return;

    const mouseTime = getTimeFromMouseY(e.clientY, timelineElement);
    
    let offset = 0;
    if (edge === 'move') {
      offset = mouseTime - currentBlock.start;
    }

    dragStartPos.current = {
      mouseTime,
      blockStart: currentBlock.start,
      blockEnd: currentBlock.end,
      offset
    };

    setDragging({ dateKey, person, blockId, edge });
  };

  const handleMouseMove = useCallback((e) => {
    if (!dragging || !dragStartPos.current) return;
    
    const { dateKey, person, blockId, edge } = dragging;
    const timelineKey = `${person}-${dateKey}`;
    const timelineElement = timelineRefs.current[timelineKey];
    
    if (!timelineElement) return;

    const currentMouseTime = getTimeFromMouseY(e.clientY, timelineElement);
    const { blockStart, blockEnd, offset } = dragStartPos.current;
    const duration = blockEnd - blockStart;

    const schedule = getScheduleForDate(dateKey);
    const blocks = person === 'mom' ? schedule.momBlocks : schedule.dadBlocks;
    
    const updatedBlocks = blocks.map(block => {
      if (block.id !== blockId) return block;
      
      if (edge === 'start') {
        const newStart = Math.max(0, Math.min(currentMouseTime, block.end - 0.25));
        return { ...block, start: newStart };
      } else if (edge === 'end') {
        const newEnd = Math.min(24, Math.max(currentMouseTime, block.start + 0.25));
        return { ...block, end: newEnd };
      } else {
        const newStart = Math.max(0, Math.min(24 - duration, currentMouseTime - offset));
        return { ...block, start: newStart, end: newStart + duration };
      }
    });
    
    updateScheduleForDate(dateKey, {
      [person === 'mom' ? 'momBlocks' : 'dadBlocks']: updatedBlocks,
      manuallyModified: true
    });
  }, [dragging, getScheduleForDate, updateScheduleForDate]);

  const handleMouseUp = useCallback(() => {
    if (dragging) {
      const { dateKey, person } = dragging;
      
      setTimeout(() => {
        recalculateDutyBlocks(dateKey, person);
      }, 0);
    }
    
    setDragging(null);
    dragStartPos.current = null;
  }, [dragging, recalculateDutyBlocks]);

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, handleMouseMove, handleMouseUp]);

  return {
    dragging,
    timelineRefs,
    handleMouseDown
  };
};
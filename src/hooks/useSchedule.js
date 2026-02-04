import { useState } from 'react';

export const useSchedule = (babyAge, feedInterval, feedDuration, targetSleepDuration, showPredictions, momPreferredSleepStart, dadPreferredSleepStart, allowOverlap) => {
  const [viewStartDate, setViewStartDate] = useState(new Date());
  const [selectedDays] = useState(5);
  const [expandedDays, setExpandedDays] = useState({ 0: true });

  const getDefaultScheduleForDate = () => ({
    manualFeedTimes: null,
    momBlocks: [
      { id: 1, type: 'sleep', start: 0, end: 6 },
      { id: 2, type: 'duty', start: 6, end: 12 },
      { id: 3, type: 'sleep', start: 12, end: 16 },
      { id: 4, type: 'duty', start: 16, end: 24 }
    ],
    dadBlocks: [
      { id: 1, type: 'duty', start: 0, end: 6 },
      { id: 2, type: 'sleep', start: 6, end: 12 },
      { id: 3, type: 'duty', start: 12, end: 16 },
      { id: 4, type: 'sleep', start: 16, end: 24 }
    ],
    manuallyModified: false,
    momPreferredSleepStart: null,
    dadPreferredSleepStart: null,
    loggedEvents: []
  });

  const [dailySchedules, setDailySchedules] = useState(() => {
    try {
      const saved = localStorage.getItem('babyRhythm_dailySchedules');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const getScheduleForDate = (dateKey) => {
    if (!dailySchedules[dateKey]) {
      return getDefaultScheduleForDate();
    }
    return dailySchedules[dateKey];
  };

  const updateScheduleForDate = (dateKey, updates) => {
    setDailySchedules(prev => {
      const currentSchedule = prev[dateKey] || getDefaultScheduleForDate();
      const next = {
        ...prev,
        [dateKey]: {
          ...currentSchedule,
          ...updates
        }
      };
      try { localStorage.setItem('babyRhythm_dailySchedules', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const toggleDay = (dateKey) => {
    setExpandedDays(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey]
    }));
  };

  const recalculateDutyBlocks = (dateKey, person) => {
    const schedule = getScheduleForDate(dateKey);
    const blocks = person === 'mom' ? schedule.momBlocks : schedule.dadBlocks;
    
    const fixedBlocks = blocks.filter(b => b.type === 'sleep' || b.type === 'work');
    
    if (fixedBlocks.length === 0) {
      updateScheduleForDate(dateKey, {
        [person === 'mom' ? 'momBlocks' : 'dadBlocks']: [
          { id: 1, type: 'duty', start: 0, end: 24 }
        ]
      });
      return;
    }
    
    const sortedFixed = [...fixedBlocks].sort((a, b) => a.start - b.start);
    
    const sleepBlocks = sortedFixed.filter(b => b.type === 'sleep');
    let longestSleep = null;
    let maxDuration = 0;
    
    for (const block of sleepBlocks) {
      const duration = block.end - block.start;
      if (duration > maxDuration) {
        maxDuration = duration;
        longestSleep = block;
      }
    }
    
    const newPreferredKey = person === 'mom' ? 'momPreferredSleepStart' : 'dadPreferredSleepStart';
    const newPreferredValue = longestSleep ? longestSleep.start : null;
    
    const newBlocks = [];
    let currentId = 1;
    let currentTime = 0;
    
    for (const block of sortedFixed) {
      if (currentTime < block.start) {
        newBlocks.push({
          id: currentId++,
          type: 'duty',
          start: currentTime,
          end: block.start
        });
      }
      
      newBlocks.push({
        ...block,
        id: currentId++
      });
      
      currentTime = block.end;
    }
    
    if (currentTime < 24) {
      newBlocks.push({
        id: currentId++,
        type: 'duty',
        start: currentTime,
        end: 24
      });
    }
    
    updateScheduleForDate(dateKey, {
      [person === 'mom' ? 'momBlocks' : 'dadBlocks']: newBlocks,
      [newPreferredKey]: newPreferredValue,
      manuallyModified: true
    });
  };

  const addBlock = (dateKey, person, type) => {
    const schedule = getScheduleForDate(dateKey);
    const blocks = person === 'mom' ? schedule.momBlocks : schedule.dadBlocks;
    
    // Find a good time slot for the new block
    let newStart = 12;
    let newEnd = 14;
    
    // Look for gaps between existing sleep/work blocks
    const fixedBlocks = blocks.filter(b => b.type === 'sleep' || b.type === 'work').sort((a, b) => a.start - b.start);
    
    if (fixedBlocks.length === 0) {
      newStart = 12;
      newEnd = 14;
    } else {
      let found = false;
      
      // Check before first block
      if (fixedBlocks[0].start >= 2) {
        newStart = 0;
        newEnd = 2;
        found = true;
      }
      
      // Check between blocks
      if (!found) {
        for (let i = 0; i < fixedBlocks.length - 1; i++) {
          const gap = fixedBlocks[i + 1].start - fixedBlocks[i].end;
          if (gap >= 2) {
            newStart = fixedBlocks[i].end;
            newEnd = newStart + 2;
            found = true;
            break;
          }
        }
      }
      
      // Check after last block
      if (!found) {
        const lastBlock = fixedBlocks[fixedBlocks.length - 1];
        if (24 - lastBlock.end >= 2) {
          newStart = lastBlock.end;
          newEnd = newStart + 2;
          found = true;
        }
      }
      
      // If still no space, overlap at default position
      if (!found) {
        newStart = 12;
        newEnd = 14;
      }
    }
    
    const newId = Math.max(...blocks.map(b => b.id), 0) + 1;
    const newBlock = { id: newId, type, start: newStart, end: newEnd };
    
    // Add the new block, then recalculate duties
    const updatedBlocks = [...blocks.filter(b => b.type === 'sleep' || b.type === 'work'), newBlock];
    
    // Rebuild with duty blocks
    const sortedFixed = updatedBlocks.sort((a, b) => a.start - b.start);
    const finalBlocks = [];
    let currentId = 1;
    let currentTime = 0;
    
    for (const block of sortedFixed) {
      if (currentTime < block.start) {
        finalBlocks.push({
          id: currentId++,
          type: 'duty',
          start: currentTime,
          end: block.start
        });
      }
      finalBlocks.push({ ...block, id: currentId++ });
      currentTime = block.end;
    }
    
    if (currentTime < 24) {
      finalBlocks.push({
        id: currentId++,
        type: 'duty',
        start: currentTime,
        end: 24
      });
    }
    
    updateScheduleForDate(dateKey, {
      [person === 'mom' ? 'momBlocks' : 'dadBlocks']: finalBlocks,
      manuallyModified: true
    });
  };

  const removeBlock = (dateKey, person, blockId) => {
    const schedule = getScheduleForDate(dateKey);
    const blocks = person === 'mom' ? schedule.momBlocks : schedule.dadBlocks;
    
    // Find the block to remove
    const blockToRemove = blocks.find(b => b.id === blockId);
    
    // Don't allow removing duty blocks (they're auto-generated)
    if (blockToRemove && blockToRemove.type === 'duty') {
      return;
    }
    
    // Get only sleep/work blocks (excluding the one to delete)
    const fixedBlocks = blocks.filter(b => 
      (b.type === 'sleep' || b.type === 'work') && b.id !== blockId
    );
    
    if (fixedBlocks.length === 0) {
      alert('Cannot remove the last sleep/work block. At least one block is required.');
      return;
    }
    
    // Rebuild with duty blocks
    const sortedFixed = fixedBlocks.sort((a, b) => a.start - b.start);
    const finalBlocks = [];
    let currentId = 1;
    let currentTime = 0;
    
    for (const block of sortedFixed) {
      if (currentTime < block.start) {
        finalBlocks.push({
          id: currentId++,
          type: 'duty',
          start: currentTime,
          end: block.start
        });
      }
      finalBlocks.push({ ...block, id: currentId++ });
      currentTime = block.end;
    }
    
    if (currentTime < 24) {
      finalBlocks.push({
        id: currentId++,
        type: 'duty',
        start: currentTime,
        end: 24
      });
    }
    
    updateScheduleForDate(dateKey, {
      [person === 'mom' ? 'momBlocks' : 'dadBlocks']: finalBlocks,
      manuallyModified: true
    });
  };

  const getFeedTimes = (dateKey) => {
    const schedule = getScheduleForDate(dateKey);
    if (schedule.manualFeedTimes) {
      return [...schedule.manualFeedTimes].sort((a, b) => a - b);
    }
    
    const feeds = [];
    let currentTime = 0;
    while (currentTime < 24) {
      feeds.push(currentTime);
      currentTime += feedInterval;
    }
    return feeds;
  };

  const getPredictedSleep = (dateKey) => {
    const age = babyAge.weeks;
    
    if (age < 12) {
      return [
        { start: 0, end: 2, confidence: 0.7 },
        { start: 4, end: 6, confidence: 0.6 },
        { start: 9, end: 11, confidence: 0.5 },
        { start: 13, end: 15, confidence: 0.6 },
        { start: 17, end: 19, confidence: 0.5 },
        { start: 21, end: 24, confidence: 0.7 }
      ];
    } else if (age < 24) {
      return [
        { start: 0, end: 4, confidence: 0.8 },
        { start: 9, end: 11, confidence: 0.7 },
        { start: 14, end: 16, confidence: 0.6 },
        { start: 20, end: 24, confidence: 0.8 }
      ];
    } else {
      return [
        { start: 0, end: 6, confidence: 0.9 },
        { start: 10, end: 12, confidence: 0.7 },
        { start: 14, end: 16, confidence: 0.7 },
        { start: 19, end: 24, confidence: 0.9 }
      ];
    }
  };

  const calculateStats = (dateKey) => {
    const schedule = getScheduleForDate(dateKey);
    
    const momSleepBlocks = schedule.momBlocks.filter(b => b.type === 'sleep');
    const dadSleepBlocks = schedule.dadBlocks.filter(b => b.type === 'sleep');
    
    const momTotal = momSleepBlocks.reduce((sum, b) => sum + (b.end - b.start), 0);
    const dadTotal = dadSleepBlocks.reduce((sum, b) => sum + (b.end - b.start), 0);
    
    const momLongest = Math.max(...momSleepBlocks.map(b => b.end - b.start), 0);
    const dadLongest = Math.max(...dadSleepBlocks.map(b => b.end - b.start), 0);
    
    return {
      mom: { totalSleep: momTotal, longestBlock: momLongest },
      dad: { totalSleep: dadTotal, longestBlock: dadLongest }
    };
  };

  // Helper function that calculates autosolve for a single day without updating state
  const calculateAutoSolveForDay = (dateKey, currentSchedules) => {
    const daySchedule = currentSchedules[dateKey] || getDefaultScheduleForDate();

    // Get feed times (use manual if set, otherwise default interval)
    const feeds = daySchedule.manualFeedTimes
      ? [...daySchedule.manualFeedTimes].sort((a, b) => a - b)
      : (() => {
          const f = [];
          let t = 0;
          while (t < 24) { f.push(t); t += feedInterval; }
          return f;
        })();

    const feedWindows = feeds.map(time => ({
      start: time,
      end: Math.min(time + feedDuration, 24)
    }));

    const momWorkBlocks = daySchedule.momBlocks.filter(b => b.type === 'work');
    const dadWorkBlocks = daySchedule.dadBlocks.filter(b => b.type === 'work');

    const effectiveMomPreference = daySchedule.momPreferredSleepStart !== null
      ? daySchedule.momPreferredSleepStart
      : momPreferredSleepStart;

    const effectiveDadPreference = daySchedule.dadPreferredSleepStart !== null
      ? daySchedule.dadPreferredSleepStart
      : dadPreferredSleepStart;

    const findBestSleepWindow = (preferredStart, duration, workBlocks, mustStartAfter = null) => {
      let bestStart = preferredStart;
      let bestScore = -Infinity;
      let foundValidWindow = false;

      for (let start = 0; start <= 24 - duration; start += 0.25) {
        const end = start + duration;

        if (mustStartAfter !== null && start < mustStartAfter) {
          continue;
        }

        let hasWorkConflict = false;
        for (const block of workBlocks) {
          if (start < block.end && end > block.start) {
            hasWorkConflict = true;
            break;
          }
        }

        if (hasWorkConflict) {
          continue;
        }

        foundValidWindow = true;

        const distanceFromPreference = Math.abs(start - preferredStart);

        let alignmentBonus = 0;
        if (showPredictions) {
          const predictions = getPredictedSleep(dateKey);
          for (const pred of predictions) {
            const overlapStart = Math.max(start, pred.start);
            const overlapEnd = Math.min(end, pred.end);
            const overlap = Math.max(0, overlapEnd - overlapStart);
            alignmentBonus += overlap * pred.confidence * 2;
          }
        }

        let feedConflicts = 0;
        for (const feed of feedWindows) {
          if (start < feed.end && end > feed.start) {
            feedConflicts++;
          }
        }

        const score = -distanceFromPreference * 8 + alignmentBonus - feedConflicts * 2;

        if (score > bestScore) {
          bestScore = score;
          bestStart = start;
        }
      }

      if (!foundValidWindow) {
        const sortedWork = [...workBlocks].sort((a, b) => a.start - b.start);

        if (sortedWork.length === 0) {
          return { start: preferredStart, end: preferredStart + duration };
        }

        if (sortedWork[0].start >= duration) {
          return { start: 0, end: duration };
        }

        for (let i = 0; i < sortedWork.length - 1; i++) {
          const gapStart = sortedWork[i].end;
          const gapEnd = sortedWork[i + 1].start;
          const gapSize = gapEnd - gapStart;

          if (gapSize >= duration) {
            return { start: gapStart, end: gapStart + duration };
          }
        }

        const lastWork = sortedWork[sortedWork.length - 1];
        if (24 - lastWork.end >= duration) {
          return { start: lastWork.end, end: lastWork.end + duration };
        }

        return { start: preferredStart, end: preferredStart + duration };
      }

      return { start: bestStart, end: bestStart + duration };
    };

    let momSleepWindow = findBestSleepWindow(effectiveMomPreference, targetSleepDuration, momWorkBlocks);
    let dadSleepWindow = findBestSleepWindow(effectiveDadPreference, targetSleepDuration, dadWorkBlocks);

    const hasOverlap = momSleepWindow.start < dadSleepWindow.end && momSleepWindow.end > dadSleepWindow.start;

    if (!allowOverlap && hasOverlap) {
      const momDistance = Math.abs(momSleepWindow.start - effectiveMomPreference);
      const dadDistance = Math.abs(dadSleepWindow.start - effectiveDadPreference);

      if (momDistance <= dadDistance) {
        dadSleepWindow = findBestSleepWindow(
          effectiveDadPreference,
          targetSleepDuration,
          dadWorkBlocks,
          momSleepWindow.end
        );
      } else {
        momSleepWindow = findBestSleepWindow(
          effectiveMomPreference,
          targetSleepDuration,
          momWorkBlocks,
          dadSleepWindow.end
        );
      }
    }

    const newMomBlocks = [];
    let momId = 1;

    momWorkBlocks.forEach(workBlock => {
      newMomBlocks.push({ ...workBlock, id: momId++ });
    });

    newMomBlocks.push({
      id: momId++,
      type: 'sleep',
      start: momSleepWindow.start,
      end: momSleepWindow.end
    });

    const sortedMomBlocks = [...newMomBlocks].sort((a, b) => a.start - b.start);
    const finalMomBlocks = [];
    let currentTime = 0;

    for (const block of sortedMomBlocks) {
      if (currentTime < block.start) {
        finalMomBlocks.push({
          id: momId++,
          type: 'duty',
          start: currentTime,
          end: block.start
        });
      }
      finalMomBlocks.push(block);
      currentTime = block.end;
    }

    if (currentTime < 24) {
      finalMomBlocks.push({
        id: momId++,
        type: 'duty',
        start: currentTime,
        end: 24
      });
    }

    const newDadBlocks = [];
    let dadId = 1;

    dadWorkBlocks.forEach(workBlock => {
      newDadBlocks.push({ ...workBlock, id: dadId++ });
    });

    newDadBlocks.push({
      id: dadId++,
      type: 'sleep',
      start: dadSleepWindow.start,
      end: dadSleepWindow.end
    });

    const sortedDadBlocks = [...newDadBlocks].sort((a, b) => a.start - b.start);
    const finalDadBlocks = [];
    currentTime = 0;

    for (const block of sortedDadBlocks) {
      if (currentTime < block.start) {
        finalDadBlocks.push({
          id: dadId++,
          type: 'duty',
          start: currentTime,
          end: block.start
        });
      }
      finalDadBlocks.push(block);
      currentTime = block.end;
    }

    if (currentTime < 24) {
      finalDadBlocks.push({
        id: dadId++,
        type: 'duty',
        start: currentTime,
        end: 24
      });
    }

    return {
      momBlocks: finalMomBlocks,
      dadBlocks: finalDadBlocks,
      manuallyModified: false,
      // Preserve logged events and other fields
      loggedEvents: daySchedule.loggedEvents || [],
      manualFeedTimes: daySchedule.manualFeedTimes,
      momPreferredSleepStart: daySchedule.momPreferredSleepStart,
      dadPreferredSleepStart: daySchedule.dadPreferredSleepStart
    };
  };

  const autoSolveDay = (dateKey) => {
    const result = calculateAutoSolveForDay(dateKey, dailySchedules);
    updateScheduleForDate(dateKey, result);
  };

  // Batch autosolve for multiple days - single state update
  const batchAutoSolveDays = (dateKeys) => {
    setDailySchedules(prev => {
      const next = { ...prev };

      dateKeys.forEach(dateKey => {
        const result = calculateAutoSolveForDay(dateKey, prev);
        const currentSchedule = prev[dateKey] || getDefaultScheduleForDate();
        next[dateKey] = {
          ...currentSchedule,
          ...result
        };
      });

      try { localStorage.setItem('babyRhythm_dailySchedules', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return {
    viewStartDate,
    selectedDays,
    expandedDays,
    dailySchedules,
    getScheduleForDate,
    updateScheduleForDate,
    toggleDay,
    recalculateDutyBlocks,
    addBlock,
    removeBlock,
    getFeedTimes,
    getPredictedSleep,
    calculateStats,
    autoSolveDay,
    batchAutoSolveDays
  };
};
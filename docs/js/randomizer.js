(() => {
  "use strict";

  function shuffledCopy(list) {
    const result = [...list];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  }

  function drawBalanced(drawState, key, candidates, identity = (value) => String(value)) {
    if (!candidates.length) return null;
    const signature = candidates.map(identity).sort().join("|");
    let bag = drawState.drawBags.get(key);

    if (!bag || bag.signature !== signature || bag.values.length === 0) {
      const values = shuffledCopy(candidates);
      const lastIdentity = drawState.lastDraws.get(key);
      if (values.length > 1 && identity(values[0]) === lastIdentity) {
        const swapIndex = values.findIndex((value) => identity(value) !== lastIdentity);
        [values[0], values[swapIndex]] = [values[swapIndex], values[0]];
      }
      bag = { signature, values };
      drawState.drawBags.set(key, bag);
    }

    const selected = bag.values.shift();
    drawState.lastDraws.set(key, identity(selected));
    return selected;
  }

  function hasThreeSameCombinations(slots, previousKeys) {
    const keys = [
      ...previousKeys.slice(-2),
      ...slots.map((slot) => slot.combinationKey)
    ];
    return keys.some((key, index) =>
      index >= 2 && key === keys[index - 1] && key === keys[index - 2]
    );
  }

  function isPerfectAlternation(slots) {
    return slots.length > 1 && slots.every((slot, index) =>
      index === 0 || slot.type !== slots[index - 1].type
    );
  }

  function makeRemainingPlan(drawState, eligibleCounters, previousKeys = []) {
    if (!eligibleCounters.length) return [];

    const countSlots = Array.from({ length: 5 }, () => {
      const counter = drawBalanced(
        drawState,
        "counter:remaining:plan",
        eligibleCounters,
        (candidate) => candidate
      );
      return {
        type: "remaining-count",
        counter,
        combinationKey: `remaining-count:${counter}`
      };
    });
    const timeSlots = Array.from({ length: 5 }, () => ({
      type: "remaining-time",
      counter: "fun",
      combinationKey: "remaining-time:fun"
    }));
    const source = [...countSlots, ...timeSlots];

    for (let attempt = 0; attempt < 300; attempt += 1) {
      const candidate = shuffledCopy(source);
      if (!hasThreeSameCombinations(candidate, previousKeys) && !isPerfectAlternation(candidate)) {
        return candidate;
      }
    }

    // 乱数で条件を満たせない場合にも、安全な順序を返す。
    const fallback = [];
    const counts = [...countSlots];
    const times = [...timeSlots];
    while (counts.length || times.length) {
      const recent = [...previousKeys.slice(-2), ...fallback.map((slot) => slot.combinationKey)];
      const wouldMakeThree = (slot) => {
        const lastTwo = recent.slice(-2);
        return lastTwo.length === 2 && lastTwo.every((key) => key === slot.combinationKey);
      };
      const preferred = fallback.length % 4 < 2 ? counts : times;
      const alternate = preferred === counts ? times : counts;
      const sourceList = preferred.find((slot) => !wouldMakeThree(slot)) ? preferred : alternate;
      const index = sourceList.findIndex((slot) => !wouldMakeThree(slot));
      fallback.push(sourceList.splice(index >= 0 ? index : 0, 1)[0]);
    }
    return fallback;
  }

  function reset(drawState) {
    drawState.drawBags.clear();
    drawState.lastDraws.clear();
    drawState.remainingPlan = [];
    drawState.remainingRecentKeys = [];
  }

  window.CounterTrainingRandomizer = Object.freeze({
    drawBalanced,
    makeRemainingPlan,
    reset,
    shuffledCopy
  });
})();

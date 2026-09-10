<script>
  import { getLast365Days } from '../utils.js';

  export let completions = [];
  export let habits = [];
  export let type = 'overview'; // 'overview' or 'habit' - used for future customization
  export let habitId = null;

  let dates = getLast365Days();
  let monthLabels = [];

  // Count completions per day
  $: completionMap = (() => {
    const map = {};
    const filtered = habitId 
      ? completions.filter(c => c.habit_id === habitId)
      : completions;
    
    filtered.forEach(c => {
      map[c.date] = (map[c.date] || 0) + c.count;
    });
    return map;
  })();

  // Generate month labels
  $: {
    const labels = [];
    let lastMonth = -1;
    dates.forEach((date, index) => {
      const month = new Date(date).getMonth();
      if (month !== lastMonth) {
        labels.push({
          month: new Date(date).toLocaleString('en-US', { month: 'short' }),
          index
        });
        lastMonth = month;
      }
    });
    monthLabels = labels;
  }

  function getIntensity(date) {
    const count = completionMap[date] || 0;
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    if (count <= 5) return 3;
    return 4;
  }

  function getTooltip(date) {
    const count = completionMap[date] || 0;
    const dateStr = new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
    });
    if (count === 0) return `No completions on ${dateStr}`;
    return `${count} completion${count > 1 ? 's' : ''} on ${dateStr}`;
  }

  // Organize into weeks (columns of 7 days)
  $: weeks = (() => {
    const result = [];
    let currentWeek = [];
    
    // Pad first week to align with correct day
    const firstDay = new Date(dates[0]).getDay();
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null);
    }
    
    dates.forEach(date => {
      currentWeek.push(date);
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });
    
    if (currentWeek.length > 0) {
      result.push(currentWeek);
    }
    
    return result;
  })();
</script>

<div class="heatmap-container">
  <div class="heatmap-months">
    {#each monthLabels as label}
      <span class="month-label" style="left: {label.index * 14}px">
        {label.month}
      </span>
    {/each}
  </div>
  
  <div class="heatmap-grid">
    <div class="day-labels">
      <span>Mon</span>
      <span>Wed</span>
      <span>Fri</span>
    </div>
    
    <div class="heatmap-weeks">
      {#each weeks as week}
        <div class="heatmap-week">
          {#each week as date}
            {#if date === null}
              <div class="heatmap-cell empty"></div>
            {:else}
              <div 
                class="heatmap-cell"
                class:level-0={getIntensity(date) === 0}
                class:level-1={getIntensity(date) === 1}
                class:level-2={getIntensity(date) === 2}
                class:level-3={getIntensity(date) === 3}
                class:level-4={getIntensity(date) === 4}
                title={getTooltip(date)}
              ></div>
            {/if}
          {/each}
        </div>
      {/each}
    </div>
  </div>

  <div class="heatmap-legend">
    <span class="legend-label">Less</span>
    <div class="legend-cell level-0"></div>
    <div class="legend-cell level-1"></div>
    <div class="legend-cell level-2"></div>
    <div class="legend-cell level-3"></div>
    <div class="legend-cell level-4"></div>
    <span class="legend-label">More</span>
  </div>
</div>

<style>
  .heatmap-container {
    background: var(--bg-secondary);
    padding: 1.25rem;
    border-radius: 0.75rem;
    border: 1px solid var(--border);
    overflow-x: auto;
  }

  .heatmap-months {
    position: relative;
    height: 1.25rem;
    margin-left: 2.5rem;
    margin-bottom: 0.25rem;
  }

  .month-label {
    position: absolute;
    font-size: 0.7rem;
    color: var(--text-secondary);
  }

  .heatmap-grid {
    display: flex;
    gap: 0.25rem;
  }

  .day-labels {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0.25rem 0;
    min-width: 2rem;
  }

  .day-labels span {
    font-size: 0.65rem;
    color: var(--text-secondary);
    line-height: 14px;
  }

  .heatmap-weeks {
    display: flex;
    gap: 3px;
  }

  .heatmap-week {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .heatmap-cell {
    width: 13px;
    height: 13px;
    border-radius: 2px;
    cursor: pointer;
    transition: transform 0.1s;
  }

  .heatmap-cell:hover {
    transform: scale(1.3);
    outline: 2px solid var(--primary);
  }

  .heatmap-cell.empty {
    visibility: hidden;
  }

  .heatmap-cell.level-0 { background: var(--heatmap-0); }
  .heatmap-cell.level-1 { background: var(--heatmap-1); }
  .heatmap-cell.level-2 { background: var(--heatmap-2); }
  .heatmap-cell.level-3 { background: var(--heatmap-3); }
  .heatmap-cell.level-4 { background: var(--heatmap-4); }

  .heatmap-legend {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 3px;
    margin-top: 0.75rem;
  }

  .legend-label {
    font-size: 0.7rem;
    color: var(--text-secondary);
    margin: 0 0.25rem;
  }

  .legend-cell {
    width: 11px;
    height: 11px;
    border-radius: 2px;
  }

  .legend-cell.level-0 { background: var(--heatmap-0); }
  .legend-cell.level-1 { background: var(--heatmap-1); }
  .legend-cell.level-2 { background: var(--heatmap-2); }
  .legend-cell.level-3 { background: var(--heatmap-3); }
  .legend-cell.level-4 { background: var(--heatmap-4); }
</style>

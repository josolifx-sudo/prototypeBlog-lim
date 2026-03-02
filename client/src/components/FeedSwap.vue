<template>
    <div class="swap glass" role="tablist" aria-label="Feed filter">
      <span class="thumb" :style="thumbStyle" aria-hidden="true"></span>
  
      <button
        ref="btnLatest"
        class="tab"
        :class="{ active: modelValue === 'latest' }"
        @click="$emit('update:modelValue', 'latest')"
        type="button"
      >
        Latest
      </button>
  
      <button
        ref="btnTop"
        class="tab"
        :class="{ active: modelValue === 'top' }"
        @click="$emit('update:modelValue', 'top')"
        type="button"
      >
        Top
      </button>
    </div>
  </template>
  
  <script>
  import { computed, nextTick, onMounted, ref, watch } from "vue";
  
  export default {
    name: "FeedSwap",
    props: {
      modelValue: { type: String, required: true }
    },
    emits: ["update:modelValue"],
    setup(props) {
      const btnLatest = ref(null);
      const btnTop = ref(null);
  
      const left = ref(6);
      const width = ref(70);
  
      function activeEl() {
        return props.modelValue === "top" ? btnTop.value : btnLatest.value;
      }
  
      async function sync() {
        await nextTick();
        const wrap = document.querySelector(".swap");
        const el = activeEl();
        if (!wrap || !el) return;
  
        const wr = wrap.getBoundingClientRect();
        const er = el.getBoundingClientRect();
  
        left.value = Math.max(6, er.left - wr.left);
        width.value = Math.max(54, er.width);
      }
  
      const thumbStyle = computed(() => ({
        transform: `translateX(${left.value}px)`,
        width: `${width.value}px`
      }));
  
      onMounted(sync);
      watch(() => props.modelValue, sync);
  
      return { btnLatest, btnTop, thumbStyle };
    }
  };
  </script>
  
  <style scoped>
  .swap {
    position: relative;
    display: inline-flex;
    gap: 6px;
    padding: 6px;
    border-radius: 999px;
    border: 1px solid var(--line);
    background: rgba(255, 255, 255, 0.06);
  }
  
  .thumb {
  position: absolute;
  left: 0;
  top: 6px;
  height: calc(100% - 12px);
  border-radius: 999px;
  background: linear-gradient(
    135deg,
    rgba(110, 231, 255, 0.35),
    rgba(167, 139, 250, 0.30)
  );
  box-shadow: 0 0 10px rgba(110, 231, 255, 0.30);
  transition: transform 220ms ease, width 220ms ease;
  pointer-events: none;
}
  
  .tab {
    position: relative;
    z-index: 1;
    border: 0;
    background: transparent;
    color: var(--muted);
    padding: 10px 12px;
    border-radius: 999px;
    cursor: pointer;
    font-weight: 800;
    transition: color 160ms ease;
  }
  
  .tab.active {
    color: var(--text);
  }
  </style>
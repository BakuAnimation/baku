<template>
  <div
    ref="sliderWrapper"
    class="b-slider-thumb-wrapper"
    :class="{ 'is-dragging': dragging }"
    :style="wrapperStyle"
  >
    <b-tooltip
      :label="tooltipLabel"
      :type="type"
      :always="dragging || isFocused"
      :active="!disabled && tooltip"
    >
      <div
        class="b-slider-thumb"
        :class="{liveview: isLiveView}"
        :tabindex="disabled ? false : 0"
        v-bind="$attrs"
        @mousedown="onButtonDown"
        @touchstart="onButtonDown"
        @focus="onFocus"
        @blur="onBlur"
        @keydown.left.prevent="onLeftKeyDown"
        @keydown.right.prevent="onRightKeyDown"
        @keydown.down.prevent="onLeftKeyDown"
        @keydown.up.prevent="onRightKeyDown"
        @keydown.home.prevent="onHomeKeyDown"
        @keydown.end.prevent="onEndKeyDown"
      />
    </b-tooltip>
  </div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'BSliderThumb',
  inheritAttrs: false,
  props: {
    value: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      default: '',
    },
    tooltip: {
      type: Boolean,
      default: true,
    },
    customFormatter: Function,
  },
  data() {
    return {
      isFocused: false,
      dragging: false,
      startX: 0,
      startPosition: 0,
      newPosition: null,
      oldValue: this.value,
    };
  },
  computed: {
    isLiveView() {
      return this.value === this.$parent.max;
    },
    disabled() {
      return this.$parent.disabled;
    },
    max() {
      return this.$parent.max;
    },
    min() {
      return this.$parent.min;
    },
    step() {
      return this.$parent.step;
    },
    precision() {
      return this.$parent.precision;
    },
    currentPosition() {
      return `${((this.value - this.min) / (this.max - this.min)) * 100}%`;
    },
    wrapperStyle() {
      return { left: this.currentPosition };
    },
    tooltipLabel() {
      return typeof this.customFormatter !== 'undefined'
        ? this.customFormatter(this.value)
        : this.value.toString();
    },
  },
  methods: {
    onFocus() {
      this.isFocused = true;
    },
    onBlur() {
      this.isFocused = false;
    },
    onButtonDown(event) {
      if (this.disabled) return;
      event.preventDefault();
      this.onDragStart(event);
      if (typeof window !== 'undefined') {
        document.addEventListener('mousemove', this.onDragging);
        document.addEventListener('touchmove', this.onDragging);
        document.addEventListener('mouseup', this.onDragEnd);
        document.addEventListener('touchend', this.onDragEnd);
        document.addEventListener('contextmenu', this.onDragEnd);
      }
    },
    onLeftKeyDown() {
      if (this.disabled || this.value === this.min) return;
      this.newPosition = parseFloat(this.currentPosition)
        - (this.step / (this.max - this.min)) * 100;
      this.setPosition(this.newPosition);
      this.$parent.emitValue('change');
    },
    onRightKeyDown() {
      if (this.disabled || this.value === this.max) return;
      this.newPosition = parseFloat(this.currentPosition)
        + (this.step / (this.max - this.min)) * 100;
      this.setPosition(this.newPosition);
      this.$parent.emitValue('change');
    },
    onHomeKeyDown() {
      if (this.disabled || this.value === this.min) return;
      this.newPosition = 0;
      this.setPosition(this.newPosition);
      this.$parent.emitValue('change');
    },
    onEndKeyDown() {
      if (this.disabled || this.value === this.max) return;
      this.newPosition = 100;
      this.setPosition(this.newPosition);
      this.$parent.emitValue('change');
    },
    onDragStart(event) {
      this.dragging = true;
      this.$emit('dragstart');
      if (event.type === 'touchstart') {
        // eslint-disable-next-line no-param-reassign
        event.clientX = event.touches[0].clientX;
      }
      this.startX = event.clientX;
      this.startPosition = parseFloat(this.currentPosition);
      this.newPosition = this.startPosition;
    },
    onDragging(event) {
      if (this.dragging) {
        if (event.type === 'touchmove') {
          // eslint-disable-next-line no-param-reassign
          event.clientX = event.touches[0].clientX;
        }
        const diff = ((event.clientX - this.startX) / this.$parent.sliderSize) * 100;
        this.newPosition = this.startPosition + diff;
        this.setPosition(this.newPosition);
      }
    },
    onDragEnd(event) {
      this.dragging = false;
      this.$emit('dragend', { oldValue: this.oldValue, shiftKey: event.shiftKey });
      if (this.value !== this.oldValue) {
        this.$parent.emitValue('change');
      }
      this.setPosition(this.newPosition);
      if (typeof window !== 'undefined') {
        document.removeEventListener('mousemove', this.onDragging);
        document.removeEventListener('touchmove', this.onDragging);
        document.removeEventListener('mouseup', this.onDragEnd);
        document.removeEventListener('touchend', this.onDragEnd);
        document.removeEventListener('contextmenu', this.onDragEnd);
      }
    },
    setPosition(percent) {
      if (percent === null || Number.isNaN(percent)) return;
      let absPercent = (percent < 0) ? 0 : percent;
      absPercent = (percent > 100) ? 100 : absPercent;
      const stepLength = 100 / ((this.max - this.min) / this.step);
      const steps = Math.round(absPercent / stepLength);
      let value = ((steps * stepLength) / 100) * (this.max - this.min) + this.min;
      value = parseFloat(value.toFixed(this.precision));
      this.$emit('input', value);
      if (!this.dragging && value !== this.oldValue) {
        this.oldValue = value;
      }
    },
  },
})
export default class ReadingSliderComponent extends Vue {
  setFrame(frame) {
    this.$refs.sliderWrapper.style.left = `${((frame - this.min) / (this.max - this.min)) * 100}%`;
  }
}
</script>

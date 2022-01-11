<script>
import Drift from '../assets/drift-zoom/src/js/Drift.js';
import FillDown from '../assets/svg-icons/arrow-down-s-fill.svg';
import LineDown from '../assets/svg-icons/arrow-down-s-line.svg';
import FillLeft from '../assets/svg-icons/arrow-left-s-fill.svg';
import LineLeft from '../assets/svg-icons/arrow-left-s-line.svg';
import FillRight from '../assets/svg-icons/arrow-right-s-fill.svg';
import LineRight from '../assets/svg-icons/arrow-right-s-line.svg';
import FillUp from '../assets/svg-icons/arrow-up-s-fill.svg';
import LineUp from '../assets/svg-icons/arrow-up-s-line.svg';

const actionName = s =>
  'scrollerAt' + (s.substr(0, 1).toUpperCase() + s.substr(1).toLowerCase());

const getCalculatedPanePosition = (paneStyle = 'pane', rect, PanePosition) => {
  if (PanePosition === 'left') {
    return 'width:' +
      rect.width +
      'px;height:' +
      rect.height +
      'px;left:' + (paneStyle === 'container' ? 0 : (0 - rect.width - window.scrollX - 5)) +
      'px;';
  } else if (PanePosition === 'right') {
    return 'width:' +
      rect.width +
      'px;height:' +
      rect.height +
      'px;left:' + (paneStyle === 'container' ? 0 : (rect.width + window.scrollX + 5)) +
      'px;';
  }

  return '';
};

export default {
  name: 'ProductZoomer',
  props: {
    baseZoomerOptions: {
      type: Object,
      default: () => ({})
    },
    baseImages: {
      type: Object,
      required: true,
      default: () => ({})
    },
  },
  data() {
    return {
      previewImg: {},
      previewLargeImg: {},
      thumbs: [],
      normal_size: [],
      large_size: [],
      choosedThumb: {},
      drift: null,
      options: {
        zoomFactor: 4,
        pane: 'container',
        hoverDelay: 300,
        namespace: 'container-zoomer',
        move_by_click: true,
        scroll_items: 4,
        choosed_thumb_border_color: '#FF3D00',
        scroller_button_style: 'line',
        scroller_position: 'left',
        zoomer_pane_position: 'right',
      },
    };
  },
  computed: {
    base_container_div() {
      return document.querySelector(
        `.${this.options.namespace}-base-container`,
      );
    },
    pane_container_id() {
      return this.options.namespace + '-pane-container';
    },
    preview_img() {
      return `.${this.options.namespace}-base-container .preview-box`;
    },
    scroller_icon_first() {
      if (['top', 'bottom'].includes(this.options.scroller_position)) {
        if (this.options.scroller_button_style === 'line') {
          return LineLeft;
        } else {
          return FillLeft;
        }
      } else if (['left', 'right'].includes(this.options.scroller_position)) {
        if (this.options.scroller_button_style === 'line') {
          return LineUp;
        } else {
          return FillUp;
        }
      }
    },
    scroller_icon_second() {
      if (['top', 'bottom'].includes(this.options.scroller_position)) {
        if (this.options.scroller_button_style === 'line') {
          return LineRight;
        } else {
          return FillRight;
        }
      } else if (['left', 'right'].includes(this.options.scroller_position)) {
        if (this.options.scroller_button_style === 'line') {
          return LineDown;
        } else {
          return FillDown;
        }
      }
    },
  },
  mounted() {
    if (
      !['left', 'right', 'top', 'bottom'].includes(
        this.options.scroller_position,
      )
    ) {
      throw 'scroller_position is invalid';
    }
    if (!['fill', 'line'].includes(this.options.scroller_button_style)) {
      throw 'scroller_button_style is invalid';
    }
    if (!['left', 'right'].includes(this.options.zoomer_pane_position)) {
      throw 'zoomer_pane_position is invalid';
    }
    this.$nextTick(() => {
      this[actionName(this.options.scroller_position)]();
      this.options.injectBaseStyles = true;
      if (this.options.pane === 'container-round') {
        this.options.inlinePane = true;
      } else {
        this.options.inlinePane = false;
        this.options.paneContainer = document.getElementById(
          this.pane_container_id,
        );
        const rect = document
          .querySelector(`.${this.options.namespace}-base-container`)
          .getBoundingClientRect();
        document
          .getElementById(this.pane_container_id)
          .setAttribute(
            'style',
            getCalculatedPanePosition(
              this.options.pane,
              rect,
              this.options.zoomer_pane_position,
            ),
          );
      }
      this.drift = new Drift(
        document.querySelector(this.preview_img),
        this.options,
      );
    });
  },
  watch: {
    choosedThumb(thumb) {
      const matchNormalImg = this.normal_size.find(img => {
        return img.id === thumb.id;
      });
      const matchLargeImg = this.large_size.find(img => {
        return img.id === thumb.id;
      });
      this.previewLargeImg = Object.assign({}, matchLargeImg);
      this.previewImg = Object.assign({}, matchNormalImg);
      if (this.drift !== null) {
        this.drift.setZoomImageURL(matchLargeImg.url);
      }
    },
  },
  created() {
    if (Object.keys(this.baseImages).length > 0) {
      for (const key in this.baseImages) {
        if (this.baseImages.hasOwnProperty(key)) {
          this[key] = this.baseImages[key];
        }
      }
    }

    if (this.normal_size.length === 0) {
      throw 'Product Zoomer Need Normal Size Image At Least!!!';
    }
    if (this.thumbs.length === 0) {
      this.thumbs = Object.assign([], this.normal_size);
    } else {
      this.choosedThumb = this.thumbs[0];
    }
    if (this.large_size.length === 0) {
      this.large_size = Object.assign([], this.normal_size);
    }
    if (Object.keys(this.baseZoomerOptions).length > 0) {
      for (const key in this.baseZoomerOptions) {
        if (this.baseZoomerOptions.hasOwnProperty(key)) {
          this.options[key] = this.baseZoomerOptions[key];
        }
      }
    }

    this.options.hoverBoundingBox = !(this.options.pane === 'container-round' ||
      this.options.pane === 'container');
  },
  methods: {
    moveThumbs(direction) {
      const len = this.thumbs.length;
      if (direction === 'backward') {
        const moveThumb = this.thumbs.splice(len - 1, 1);
        this.thumbs = [moveThumb[0], ...this.thumbs];
      } else {
        const moveThumb = this.thumbs.splice(0, 1);
        this.thumbs = [...this.thumbs, moveThumb[0]];
      }
    },
    chooseThumb(thumb, { type }) {
      if (type === 'mouseover') {
        if (this.options.move_by_click !== true) {
          this.choosedThumb = thumb;
        }
      } else {
        this.choosedThumb = thumb;
      }
    },
    scrollerAtBottom() {
      const scrollerItemsCount =
        parseInt(this.baseZoomerOptions.scroll_items) + 2;
      const previewImg = document.querySelector(
        `.${this.options.namespace}-base-container .preview-box`,
      );
      const thumbList = document.querySelector(
        `.${this.options.namespace}-base-container .thumb-list`,
      );
      const thumbListHeight = thumbList.children[1].naturalHeight *
        (previewImg.naturalWidth / thumbList.children[1].naturalWidth) / (scrollerItemsCount - 1);
      document
        .querySelector(`.${this.options.namespace}-base-container`)
        .setAttribute(
          'style',
          'height:' +
          (previewImg.naturalHeight + thumbListHeight + 2) +
          'px;width:' +
          previewImg.naturalHeight +
          'px;position:relative',
        );
      document
        .querySelector(
          '.' + this.options.namespace + '-base-container ' + '.thumb-list',
        )
        .setAttribute(
          'style',
          'width:' +
          previewImg.naturalWidth +
          'px;height:' +
          thumbListHeight +
          'px;grid-template-columns:calc(100%/' +
          scrollerItemsCount +
          '/2) repeat(' +
          (scrollerItemsCount - 2) +
          ', auto) calc(100%/' +
          scrollerItemsCount +
          '/2);visibility:visible;',
        );
    },
    scrollerAtTop() {
      const scrollerItemsCount =
        parseInt(this.baseZoomerOptions.scroll_items) + 2;
      const previewImg = document.querySelector(
        '.' + this.options.namespace + '-base-container ' + '.preview-box',
      );
      const thumbList = document.querySelector(
        '.' + this.options.namespace + '-base-container ' + '.thumb-list',
      );
      const thumbListHeight = thumbList ? (thumbList.children[1].naturalHeight *
        (previewImg.naturalWidth / thumbList.children[1].naturalWidth) / (scrollerItemsCount - 1)) : 0;
      document
        .querySelector('.' + this.options.namespace + '-base-container')
        .setAttribute(
          'style',
          'height:' +
          (previewImg.naturalHeight + thumbListHeight + 2) + // 2px for grid gap
          'px;width:' +
          previewImg.naturalHeight +
          'px;position:relative',
        );
      document
        .querySelector(
          `.${this.options.namespace}-base-container .thumb-list`,
        )
        .setAttribute(
          'style',
          'width:' +
          previewImg.naturalWidth +
          'px;height:' +
          thumbListHeight +
          'px;grid-template-columns:calc(100%/' +
          scrollerItemsCount +
          '/2) repeat(' +
          (scrollerItemsCount - 2) +
          ', auto) calc(100%/' +
          scrollerItemsCount +
          '/2);visibility:visible;',
        );
    },
    scrollerAtRight() {
      const scrollerItemsCount =
        parseInt(this.baseZoomerOptions.scroll_items) + 2;
      const previewImg = document.querySelector(
        '.' + this.options.namespace + '-base-container ' + '.preview-box',
      );
      const thumbList = document.querySelector(
        '.' + this.options.namespace + '-base-container ' + '.thumb-list',
      );
      const thumbListWidth = thumbList.children[1].naturalWidth *
        (previewImg.naturalHeight / thumbList.children[1].naturalHeight) / (scrollerItemsCount - 1);
      document
        .querySelector(`.${this.options.namespace}-base-container`)
        .setAttribute(
          'style',
          'width:' +
          (previewImg.naturalWidth + thumbListWidth + 2) +
          'px;position:relative',
        );
      document
        .querySelector(
          `.${this.options.namespace}-base-container .thumb-list`,
        )
        .setAttribute(
          'style',
          'height:' +
          previewImg.naturalHeight +
          'px;width:' +
          thumbListWidth +
          'px;grid-template-rows:calc(100%/' +
          scrollerItemsCount +
          '/2) repeat(' +
          (scrollerItemsCount - 2) +
          ', auto) calc(100%/' +
          scrollerItemsCount +
          '/2);visibility:visible;',
        );
    },
    scrollerAtLeft() {
      const scrollerItemsCount =
        parseInt(this.baseZoomerOptions.scroll_items) + 2;
      const previewImg = document.querySelector(
        `.${this.options.namespace}-base-container .preview-box`,
      );
      const thumbList = document.querySelector(
        `.${this.options.namespace}-base-container .thumb-list`,
      );
      const thumbListWidth = thumbList.children[1].naturalWidth *
        (previewImg.naturalHeight / thumbList.children[1].naturalHeight) / (scrollerItemsCount - 1);
      document
        .querySelector(`.${this.options.namespace}-base-container`)
        .setAttribute(
          'style',
          'width:' +
          (previewImg.naturalWidth + thumbListWidth + 2) + // 2px for grid gap
          'px;position:relative',
        );
      document
        .querySelector(
          `.${this.options.namespace}-base-container .thumb-list`,
        )
        .setAttribute(
          'style',
          'height:' +
          previewImg.naturalHeight +
          'px;width:' +
          thumbListWidth +
          'px;grid-template-rows:calc(100%/' +
          scrollerItemsCount +
          '/2) repeat(' +
          (scrollerItemsCount - 2) +
          ', auto) calc(100%/' +
          scrollerItemsCount +
          '/2);visibility:visible;',
        );
    },
  },
};
</script>
<template>
<div :class="options.namespace + '-base-container scroller-at-' + options.scroller_position">
  <img
    :src="previewImg.url"
    :data-zoom="previewLargeImg.url"
    class="responsive-image preview-box"
    draggable="false"
  >
  <div class="thumb-list">
    <img
      :src="scroller_icon_first"
      class="zoomer-control responsive-image"
      alt="move thumb icon"
      @click="moveThumbs('backward')"
    >
    <img
      v-for="(thumb, key) in thumbs"
      v-show="key < options.scroll_items"
      :key="key"
      :src="thumb.url"
      :style="{'boxShadow' : thumb.id === choosedThumb.id ? '0 0 0 2px ' + options.choosed_thumb_border_color : ''}"
      :class="{'choosed-thumb': thumb.id === choosedThumb.id}"
      class="responsive-image"
      draggable="false"
      @click="chooseThumb(thumb, $event)"
      @mouseover="chooseThumb(thumb, $event)"
    >
    <img
      :src="scroller_icon_second"
      class="zoomer-control responsive-image"
      alt="move thumb icon"
      @click="moveThumbs('forward')"
    >
  </div>
  <div :id="pane_container_id" class="pane-container"></div>
</div>
</template>

<style>
@import "../assets/drift-zoom/src/css/drift-basic.css";
</style>

<style scoped>
.scroller-at-top {
  display: grid;
  grid-gap: 2px;
  grid-template-columns: 1fr;
  align-items: center;
}

.scroller-at-top .preview-box {
  grid-column: 1 / 2;
  grid-row: 2 / 3;
}

.scroller-at-top .thumb-list {
  display: grid;
  align-items: center;
  grid-column-gap: 0.2em;
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  visibility: hidden;
}

.scroller-at-bottom {
  display: grid;
  grid-gap: 2px;
  grid-template-columns: 1fr;
  align-items: center;
}

.scroller-at-bottom .preview-box {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
}

.scroller-at-bottom .thumb-list {
  display: grid;
  align-items: center;
  grid-column-gap: 0.2em;
  grid-column: 1 / 2;
  grid-row: 2 / 3;
  visibility: hidden;
}

.scroller-at-left {
  display: grid;
  grid-gap: 2px;
  grid-template-columns: 1fr;
}

.scroller-at-left .preview-box {
  grid-column: 2 / 3;
  grid-row: 1 / 2;
}

.scroller-at-left .thumb-list {
  display: grid;
  grid-row-gap: 0.2em;
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  visibility: hidden;
  justify-items: center;
}

.scroller-at-right {
  display: grid;
  grid-gap: 2px;
  grid-template-columns: 1fr;
}

.scroller-at-right .preview-box {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
}

.scroller-at-right .thumb-list {
  display: grid;
  grid-row-gap: 0.2em;
  grid-column: 2 / 3;
  grid-row: 1 / 2;
  visibility: hidden;
  justify-items: center;
}

.scroller-at-right .thumb-list .responsive-image,
.scroller-at-left .thumb-list .responsive-image {
  width: auto;
  height: 100%;
}

.scroller-at-top .thumb-list .responsive-image,
.scroller-at-bottom .thumb-list .responsive-image {
  height: auto;
  width: 100%;
}

.zoomer-control {
  cursor: pointer;
}

.choosed-thumb {
  border-radius: 0;
}

.pane-container {
  display: none;
  position: absolute;
  z-index: 10000;
  pointer-events: none;
}
</style>

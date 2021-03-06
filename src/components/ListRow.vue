<template lang="pug">
.columns.is-6.row.is-mobile.is-vcentered(:class="rowClasses" @click="performClick")
  .column.is-1.has-text-centered(v-if="bigIcon")
    span.icon.is-medium
      font-awesome-icon(
        :icon="bigIcon.icon"
        size="2x"
        :style="{ color: bigIcon.color || 'grey' }")
  .column
    p.title.is-5
      span {{ title }}
      span.icon.is-medium.badge-icon(v-if="badgeIcon")
        a(:title="badgeText + ' award'")
          font-awesome-icon(
            :icon="badgeIcon"
            size="xs"
            :style="{ color: badgeIconColor || 'grey' }")
      span.icon.is-medium.badge-icon(v-if="enrollment")
        a(:title="enrollment.membership.name + ' member'")
          font-awesome-icon.has-text-warning(icon="ribbon" size="xs")
    .columns
      .column.is-narrow.subtitle-column(v-for="subtitle in subtitleList")
        .subtitle.is-6.is-mobile
          font-awesome-icon.subtitle-icon(:icon="subtitle.icon" size="1x" class="has-text-grey-light")
          p.subtitle-text {{ subtitle.text }}
  .column.is-2-tablet.is-one-quarter-mobile.has-text-right(v-if="showPoints")
    span.icon.is-medium.has-text-warning
      font-awesome-icon(icon="coins" size="lg")
    span.is-size-3.has-text-weight-medium  {{ points }}
</template>

<script>
export default {
  data () {
    return {}
  },

  created () {
  },

  props: {
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: [String, Array],
      required: false
    },
    bigIcon: {
      type: Object,
      required: false
    },
    awards: {
      type: Array,
      required: false
    },
    enrollment: {
      type: Object,
      required: false
    },
    icon: {
      type: [String, Array],
      required: false
    },
    item: {
      type: Object,
      required: false
    },
    onClick: {
      type: Function,
      required: false
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    points: {
      type: Number,
      required: false,
      default: null
    }
  },
  computed: {
    rowClasses () {
      return this.disabled ? ' disabled' : ''
    },
    showPoints () {
      return this.points !== null
    },
    subtitleList () {
      const subtitles = Array.isArray(this.subtitle)
        ? this.subtitle
        : [this.subtitle]
      const icons = Array.isArray(this.icon)
        ? this.icon
        : [this.icon]
      return subtitles.map((subtitle, index) => {
        return { text: subtitle, icon: icons[index] }
      })
    },
    badgeText () {
      return this.awards[0].level.name
    },
    badgeIcon () {
      if (!this.awards || !this.awards.length) return null
      return 'star'
    },
    badgeIconColor () {
      return this.awards[0].level.color
    }
  },
  methods: {
    performClick () {
      if (this.disabled) {
        return
      }
      this.$emit('action', this.item)
    }
  }
}
</script>

<style scoped lang="scss">
.row {
  @media only screen and (max-width: 768px) {
    margin-bottom: 0.75em;
  }
}
.row:hover {
  background: hsl(0, 0%, 96%);
  cursor: pointer;
}
.row.disabled {
  background-color: hsl(0, 0%, 98%);
  &:hover {
    background: none;
    cursor: not-allowed;
  }
  .title {
    color: hsl(0, 0%, 80%);
  }
}
p.title {
  margin-bottom: 0.75em;
}
.subtitle-column {
  padding-top: 0;
  padding-bottom: 0;
  position: relative;
  &:last-child {
    padding-bottom: 0.75em;
  }
}
.subtitle-text {
  margin-left: 1.75em;
}
.subtitle-icon {
  width: 1.5em;
  float: left;
}
.badge-icon {
  justify-content: flex-end;
  width: 1.25em;
}
</style>

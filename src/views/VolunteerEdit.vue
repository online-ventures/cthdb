<template lang="pug">
div
  section.hero.is-primary
    .hero-body
      .container
        h1.title {{ title }}

  section.section
    .container
      w-form(
        :cancel="onCancel"
        :complete="onComplete"
        :record="record"
        :editorId="$auth.userId"
        :tenantId="$auth.tenantId"
        :mutation="mutation")

        h2.title.is-4 Required fields

        .columns
          .column
            .field
              label.label First Name
              .control.has-icons-left
                span.icon.is-small
                  font-awesome-icon(icon="user")
                w-input(v-model="record.first_name" required maxlength="30")
          .column
            .field
              label.label Last Name
              .control.has-icons-left
                span.icon.is-small
                  font-awesome-icon(icon="user")
                w-input(v-model="record.last_name" required maxlength="30")

        h2.title.is-4 Optional stuff

        .columns
          .column
            .field
              label.label Email
              .control.has-icons-left
                span.icon.is-small
                  font-awesome-icon(icon="envelope")
                w-input(v-model="record.email" maxlength="40" type="email")
          .column
            .field
              label.label Phone
              .control.has-icons-left
                span.icon.is-small
                  font-awesome-icon(icon="phone")
                w-input(
                  v-model="record.phone"
                  type="tel"
                  maxlength="15"
                  pattern="[0-9]{3}-?[0-9]{3}-?[0-9]{4}"
                  placeholder="123-456-7890"
                  patternMismatch="Please provide this in the format 123-456-7890")

        .columns
          .column
            .field
              label.label Street
              .control.has-icons-left
                span.icon.is-small
                  font-awesome-icon(icon="map-marker-alt")
                w-input(v-model="record.street" maxlength="40")
          .column
            .field
              label.label City
              .control.has-icons-left
                span.icon.is-small
                  font-awesome-icon(icon="map-marker-alt")
                w-input(v-model="record.city" maxlength="40")

        .columns
          .column
            .field
              label.label Notes
              .control.has-icons-left
                span.icon.is-small
                  font-awesome-icon(icon="sticky-note")
                w-input(v-model="record.notes" maxlength="80")

  section.section(v-if="volunteer")
    .container
      h2.title.is-4 Membership
      .columns
        .column(v-if="!enrollment")
          p.is-size-5 No current membership
        template(v-if="enrollment")
          .column
            p.is-size-5 {{ enrollment.membership.name }}
          .column
            p.is-size-5 Expiring on {{ enrollment.end_date }}
        .column.is-4.is-3-desktop
          button.button.is-primary.is-fullwidth(@click="goToMembership") Manage Membership

  section.section(v-if="eligibleLevels.length > 0")
    .container
      h2.title.is-4 Awards
      .columns.is-vcentered.is-centered(
        v-for="(level, index) in eligibleLevels"
        :class="{ 'has-background-white-ter': index % 2 === 0 }")
        .column.is-3
          p.title.is-5 {{ level.name }}
        .column.is-3
          p.subtitle.is-6 {{ points }} points / {{ level.points }} needed
        .column.is-3
          .buttons.has-addons.award-buttons
            button.button(
              @click="removeAward(level)"
              :class="{ 'is-primary': !awarded(level), 'is-loading': awardSaving[level.id] }")
              | Eligible
            button.button(
              @click="addAward(level)"
              :class="{ 'is-primary': awarded(level) }")
              | Awarded
        .column.is-3
          .field(v-if="awarded(level)")
            .control.has-icons-left
              span.icon.is-small
                font-awesome-icon(icon="calendar-week")
              w-input(v-model="awardFor(level).awarded_at" type="date" required @blur="updateAward(level)")
</template>

<script>
import VOLUNTEER from '@/graphql/volunteers/edit.gql'
import INSERT_VOLUNTEER from '@/graphql/volunteers/insert.gql'
import UPDATE_VOLUNTEER from '@/graphql/volunteers/update.gql'
import INSERT_AWARD from '@/graphql/awards/insert.gql'
import UPDATE_AWARD from '@/graphql/awards/update.gql'
import DELETE_AWARD from '@/graphql/awards/delete.gql'

export default {
  mounted () {
    window.scrollTo(0, 0)
  },

  data () {
    return {
      volunteer: null,
      levels: [],
      awards: [],
      awardSaving: {},
      points: 0,
      enrollment: null,
      record: {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        notes: ''
      }
    }
  },

  computed: {
    volunteerId () {
      return parseInt(this.$route.params.id)
    },
    title () {
      return this.volunteer ? this.fullName : 'Add Volunteer'
    },
    fullName () {
      return this.record.first_name + ' ' + this.record.last_name
    },
    mutation () {
      return this.volunteer ? UPDATE_VOLUNTEER : INSERT_VOLUNTEER
    },
    eligibleLevels () {
      return this.levels.filter(level => {
        return this.points >= level.points ||
          this.awards.some(award => award.level.id === level.id)
      })
    }
  },

  apollo: {
    volunteer: {
      query: VOLUNTEER,
      skip () {
        return !this.volunteerId
      },
      variables () {
        return { id: this.volunteerId, tenant_id: this.$auth.tenantId }
      },
      update (data) {
        const volunteer = data.volunteers_by_pk
        this.record = { ...volunteer }
        delete this.record.__typename
        delete this.record.joined_at
        delete this.record.enrollees
        this.awards = data.awards.map(award => Object.assign({}, award))
        this.levels = data.levels
        this.points = data.volunteer_shows_aggregate.aggregate.sum.points
        if (volunteer.enrollees.length) {
          this.enrollment = volunteer.enrollees[0].enrollment
        }
        return volunteer
      }
    }
  },

  methods: {
    goToMembership () {
      this.$router.push({
        name: 'volunteer-membership',
        params: { id: this.volunteerId }
      })
    },
    nextPage (params) {
      if (params) {
        this.$router.push({ name: 'volunteer', params: params })
      } else {
        this.$router.push({ name: 'volunteers' })
      }
    },
    onCancel () {
      const params = this.volunteer && { id: this.volunteerId }
      this.nextPage(params)
    },
    onComplete (data) {
      this.nextPage(
        this.volunteer ? { id: data.id, status: 'success' } : null
      )
    },
    eligibleText (level) {
      return this.isEligible(level) ? 'Eligible' : 'Ineligible'
    },
    isEligible (level) {
      return this.points >= level.points
    },
    awarded (level) {
      return this.awards.some(award => award.level.id === level.id)
    },
    async addAward (level) {
      this.awardSaving[level.id] = true
      const result = await this.$apollo.mutate({
        mutation: INSERT_AWARD,
        variables: {
          volunteer_id: this.volunteerId,
          level_id: level.id
        }
      })
      this.awards.push(result.data.insert_awards.returning[0])
      this.awardSaving[level.id] = false
    },
    async updateAward (level) {
      const award = this.awardFor(level)
      this.awardSaving[level.id] = true
      await this.$apollo.mutate({
        mutation: UPDATE_AWARD,
        variables: {
          volunteer_id: this.volunteerId,
          level_id: level.id,
          awarded_at: award.awarded_at
        }
      })
      this.awardSaving[level.id] = false
    },
    async removeAward (level) {
      this.awardSaving[level.id] = true
      await this.$apollo.mutate({
        mutation: DELETE_AWARD,
        variables: {
          volunteer_id: this.volunteerId,
          level_id: level.id
        }
      })
      this.awards = this.awards.filter(award => award.level.id !== level.id)
      this.awardSaving[level.id] = false
    },
    awardFor (level) {
      return this.awards.find(award => award.level.id === level.id)
    }
  }
}
</script>

<style scoped lang="scss">
.award-buttons {
  .button {
    width: 50%;
  }
}
</style>

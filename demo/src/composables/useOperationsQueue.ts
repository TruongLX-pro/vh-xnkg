import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useTeachingRequestStore } from '../stores/teachingRequest'
import type { ProcessingStatus, RequestType, ResolutionResult, SourceDepartment } from '../types'
import { isDateInRange } from '../utils/date'

export function useOperationsQueue() {
  const store = useTeachingRequestStore()
  const { requests } = storeToRefs(store)

  const statusTab = ref<ProcessingStatus>('Pending')
  const typeFilter = ref<'All' | RequestType>('All')
  const sourceFilter = ref<'All' | SourceDepartment>('All')
  const resultFilter = ref<'All' | ResolutionResult>('All')
  const classSearch = ref('')
  const teacherSearch = ref('')
  const startDateFrom = ref<string>()
  const startDateTo = ref<string>()
  const deadlineFrom = ref<string>()
  const deadlineTo = ref<string>()

  const rows = computed(() =>
    requests.value.filter((item) => {
      const statusMatched = item.processingStatus === statusTab.value
      const typeMatched = typeFilter.value === 'All' || item.requestType === typeFilter.value
      const sourceMatched = sourceFilter.value === 'All' || item.sourceDepartment === sourceFilter.value
      const resultMatched =
        resultFilter.value === 'All' || item.resolutionResult === resultFilter.value
      const startDateMatched = isDateInRange(item.startDate, startDateFrom.value, startDateTo.value)
      const deadlineValue = item.deadlineConfirmAt?.split(' ')[0]
      const deadlineMatched =
        (!deadlineFrom.value && !deadlineTo.value)
        || (deadlineValue ? isDateInRange(deadlineValue, deadlineFrom.value, deadlineTo.value) : false)
      const codeMatched = item.classCode
        .toLowerCase()
        .includes(classSearch.value.trim().toLowerCase())
      const teacherKeyword = teacherSearch.value.trim().toLowerCase()
      const teacherMatched =
        !teacherKeyword
        || item.teacherName.toLowerCase().includes(teacherKeyword)
        || item.teacherCode.toLowerCase().includes(teacherKeyword)

      return (
        statusMatched
        && typeMatched
        && sourceMatched
        && resultMatched
        && startDateMatched
        && deadlineMatched
        && codeMatched
        && teacherMatched
      )
    }),
  )

  function resetFilters() {
    typeFilter.value = 'All'
    sourceFilter.value = 'All'
    resultFilter.value = 'All'
    classSearch.value = ''
    teacherSearch.value = ''
    startDateFrom.value = undefined
    startDateTo.value = undefined
    deadlineFrom.value = undefined
    deadlineTo.value = undefined
  }

  return {
    statusTab,
    typeFilter,
    sourceFilter,
    resultFilter,
    classSearch,
    teacherSearch,
    startDateFrom,
    startDateTo,
    deadlineFrom,
    deadlineTo,
    rows,
    resetFilters,
  }
}

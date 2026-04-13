import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useTeachingRequestStore } from '../stores/teachingRequest'
import type { RequestItem, RequestType } from '../types'

type TeacherTab = 'pending' | 'history'

function matchesKeyword(item: RequestItem, keyword: string) {
  const normalized = keyword.trim().toLowerCase()
  if (!normalized) {
    return true
  }

  return (
    item.classCode.toLowerCase().includes(normalized)
    || item.className.toLowerCase().includes(normalized)
    || item.teacherName.toLowerCase().includes(normalized)
  )
}

export function useTeacherQueue() {
  const store = useTeachingRequestStore()
  const { teacherPendingRequests, teacherHistoryRequests } = storeToRefs(store)

  const activeTab = ref<TeacherTab>('pending')
  const keyword = ref('')
  const typeFilter = ref<'All' | RequestType>('All')

  const pendingRows = computed(() =>
    teacherPendingRequests.value.filter((item) => {
      const typeMatched = typeFilter.value === 'All' || item.requestType === typeFilter.value
      return typeMatched && matchesKeyword(item, keyword.value)
    }),
  )

  const historyRows = computed(() =>
    teacherHistoryRequests.value.filter((item) => {
      const typeMatched = typeFilter.value === 'All' || item.requestType === typeFilter.value
      return typeMatched && matchesKeyword(item, keyword.value)
    }),
  )

  function resetFilters() {
    keyword.value = ''
    typeFilter.value = 'All'
  }

  return {
    activeTab,
    keyword,
    typeFilter,
    pendingRows,
    historyRows,
    resetFilters,
  }
}

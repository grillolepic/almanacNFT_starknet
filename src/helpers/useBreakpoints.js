import { computed, onMounted, onUnmounted, ref } from 'vue'

export default function () {
  let windowWidth = ref(window.innerWidth)
  let windowHeight = ref(window.innerHeight)

  const onWidthChange = () => {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
  }

  onMounted(() => window.addEventListener('resize', onWidthChange))
  onUnmounted(() => window.removeEventListener('resize', onWidthChange))

  const type = computed(() => {
    if (windowWidth.value <= 600) return 'sm'
    if (windowWidth.value > 600 && windowWidth.value < 1200) return 'md'
    if (windowWidth.value >= 1200) return 'lg'
    return null
  })

  const width = computed(() => windowWidth.value)
  const height = computed(() => windowHeight.value)
  const isMobile = computed(() => type == 'sm');

  return { width, height, type, isMobile }
}

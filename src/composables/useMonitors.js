import { ref, computed } from 'vue'
import { uptimeRobotApiKeys, API_ENDPOINTS } from '../config/api'

export function useMonitors() {
  const monitors = ref([])
  const loadingMonitors = ref(true)
  const lastUpdated = ref('')
  
  const fetchMonitors = async () => {
    loadingMonitors.value = true
    
    try {
      const promises = uptimeRobotApiKeys.map(apiKey => 
        fetch(API_ENDPOINTS.monitors, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: `api_key=${apiKey}&format=json&logs=0&response_times=1&response_times_limit=1`
        }).then(res => res.json())
      )
      
      const results = await Promise.all(promises)
      
      const allMonitors = results.reduce((acc, data) => {
        if (data.stat === 'ok' && data.monitors && data.monitors.length > 0) {
          return [...acc, ...data.monitors]
        }
        return acc
      }, [])
      
      if (allMonitors.length > 0) {
        monitors.value = allMonitors.map(monitor => ({
          ...monitor,
          create_datetime: new Date(monitor.create_datetime * 1000).toLocaleString()
        }))
        lastUpdated.value = new Date().toLocaleString()
      } else {
        console.error('获取监测数据失败: 所有API密钥均未返回数据')
        monitors.value = []
      }
    } catch (error) {
      console.error('API请求错误:', error)
      monitors.value = []
    } finally {
      loadingMonitors.value = false
    }
  }

  const availability = computed(() => {
    if (!monitors.value.length) return '99.99'
    
    const totalMonitors = monitors.value.length
    const onlineMonitors = monitors.value.filter(m => m.status === 2).length
    
    return (onlineMonitors / totalMonitors * 100).toFixed(2)
  })

  return {
    monitors,
    loadingMonitors,
    lastUpdated,
    availability,
    fetchMonitors
  }
}
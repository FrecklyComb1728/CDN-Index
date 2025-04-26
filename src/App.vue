<template>
  <div class="min-h-screen flex flex-col">
    <!-- 头部 -->
    <header class="bg-gradient-custom text-white shadow-lg py-6 animate-fade-in">
      <div class="container mx-auto px-4">
        <h1 class="text-[clamp(1.5rem,3vw,2.2rem)] font-bold text-center text-shadow">
          <i class="fa-solid fa-cloud mr-2"></i>MIFENG CDN服务中心
        </h1>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
      <!-- 服务状态卡片 -->
      <div class="status-card bg-white rounded-2xl shadow-card p-6 max-w-4xl w-full mx-auto animate-slide-up" 
           style="animation-delay: 0.3s">
        <!-- 服务标识 -->
        <div class="absolute top-0 right-0 bg-warning text-white px-4 py-1 rounded-br-lg rounded-tl-lg font-medium">
          专用服务
        </div>
        
        <!-- IP信息 -->
        <div class="flex justify-between items-center mb-6">
          <div class="text-left">
            <p class="text-neutral-500 text-sm">您的IP地址</p>
            <p class="text-lg font-semibold text-neutral-800">{{ visitorIP || '正在获取...' }}</p>
          </div>
          <div class="text-right">
            <p class="text-neutral-500 text-sm">最后更新</p>
            <p class="text-lg font-semibold text-neutral-800">{{ lastUpdated }}</p>
          </div>
        </div>
        
        <!-- 服务概览 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white border border-neutral-200 rounded-xl p-4 text-center hover:shadow-md transition-custom">
            <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <i class="fa-solid fa-server text-primary text-xl"></i>
            </div>
            <p class="text-neutral-500 mb-1">全球节点</p>
            <p class="text-2xl font-bold text-primary">
              <span class="animate-pulse-slow">31</span>个
            </p>
          </div>
          <div class="bg-white border border-neutral-200 rounded-xl p-4 text-center hover:shadow-md transition-custom">
            <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <i class="fa-solid fa-bolt text-primary text-xl"></i>
            </div>
            <p class="text-neutral-500 mb-1">带宽总量</p>
            <p class="text-2xl font-bold text-primary">
              <span class="animate-pulse-slow">1000</span>Mbps
            </p>
          </div>
          <div class="bg-white border border-neutral-200 rounded-xl p-4 text-center hover:shadow-md transition-custom">
            <div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" :class="{
              'bg-green-100': availability >= 99,
              'bg-yellow-100': availability >= 90 && availability < 99,
              'bg-red-100': availability < 90
            }">
              <i class="fa-solid fa-check-circle text-xl" :class="{
                'text-success': availability >= 99,
                'text-warning': availability >= 90 && availability < 99,
                'text-danger': availability < 90
              }"></i>
            </div>
            <p class="text-neutral-500 mb-1">可用性</p>
            <p class="text-2xl font-bold" :class="{
              'text-success': availability >= 99,
              'text-warning': availability >= 90 && availability < 99,
              'text-danger': availability < 90
            }">
              <span class="animate-pulse-slow">{{ availability }}</span>%
            </p>
          </div>
        </div>
        
        <!-- 网站监测状态 -->
        <div class="bg-neutral-50 rounded-xl p-6 border border-neutral-200 mb-8">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-semibold text-neutral-800 text-lg flex items-center">
              <i class="fa-solid fa-eye mr-2"></i>网站监测状态
            </h3>
            <div class="text-sm text-neutral-500">
              <span class="animate-pulse-slow">●</span> 实时监测中
            </div>
          </div>
          
          <div v-if="loadingMonitors" class="text-center py-8">
            <i class="fa-solid fa-spinner fa-spin text-primary text-2xl"></i>
            <p class="mt-2 text-neutral-600">正在加载监测数据...</p>
          </div>
          
          <div v-else-if="!(monitors.length > 0)" class="text-center py-8">
            <i class="fa-solid fa-exclamation-circle text-neutral-400 text-2xl"></i>
            <p class="mt-2 text-neutral-600">暂无监测数据</p>
          </div>
          <div v-else class="space-y-3 max-h-[300px] overflow-y-auto scrollbar-hide pr-2 scroll-smooth">
            <div v-for="monitor in monitors" :key="monitor.id" 
                 class="bg-white p-4 rounded-lg border border-neutral-200 flex justify-between items-center hover:shadow-sm transition-custom">
              <div class="flex items-center">
                <div class="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                     :class="{'bg-green-100': monitor.status === 2, 'bg-yellow-100': monitor.status === 0 || monitor.status === 1, 'bg-red-100': monitor.status === 8 || monitor.status === 9}">
                  <i class="fa-solid fa-circle text-xs" 
                     :class="{'text-success': monitor.status === 2, 'text-yellow-500': monitor.status === 0 || monitor.status === 1, 'text-danger': monitor.status === 8 || monitor.status === 9}"></i>
                </div>
                <div>
                  <h4 class="font-medium text-neutral-800">{{ monitor.friendly_name }}</h4>
                  <p class="text-sm text-neutral-500">{{ monitor.url }}</p>
                </div>
              </div>
              <div class="text-right">
                <span class="px-3 py-1 rounded-full text-xs font-medium"
                      :class="{'bg-green-100 text-success': monitor.status === 2, 'bg-yellow-100 text-yellow-600': monitor.status === 0 || monitor.status === 1, 'bg-red-100 text-danger': monitor.status === 8 || monitor.status === 9}">
                  {{ getStatusText(monitor.status) }}
                </span>
                <p class="text-xs text-neutral-500 mt-1">
                  响应时间: {{ monitor.average_response_time || 'N/A' }}ms
                </p>
              </div>
            </div>
          </div>
        </div>
      
        
        <!-- 服务限制声明 -->
        <div class="bg-red-50 rounded-xl p-6 border border-red-200 mb-8">
          <h3 class="font-semibold text-red-600 text-lg mb-3 flex items-center">
            <i class="fa-solid fa-exclamation-triangle mr-2"></i>使用限制声明
          </h3>
          <p class="text-red-700 font-medium mb-4">
            本CDN服务专为MIFENG项目提供，未经授权的使用将被视为侵权。
          </p>
          <p class="text-neutral-600">
            若您需要使用此CDN服务，请务必提前联系我们获取授权。未经许可的使用行为，我们将采取必要的法律措施追究责任。
          </p>
        </div>
        
        <!-- 联系信息 -->
        <div class="bg-primary/5 rounded-xl p-6 border border-primary/20">
          <h3 class="font-semibold text-primary text-lg mb-3 flex items-center">
            <i class="fa-solid fa-handshake mr-2"></i>商务合作
          </h3>
          <p class="text-neutral-600 mb-4">
            如需使用我们的CDN服务，请通过以下方式联系我们获取授权：
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <a href="mailto:wdsjwyf@gmail.com"
               class="bg-white hover:bg-neutral-50 text-primary border border-primary px-6 py-3 rounded-full font-medium transition-custom flex items-center justify-center">
              <i class="fa-solid fa-envelope mr-2"></i> 发送邮件
            </a>
            <a href="http://res.abeim.cn/api-qq?qq=3979158171"
               class="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full font-medium transition-custom flex items-center justify-center">
              <i class="fa-brands fa-qq mr-2"></i> QQ联系
            </a>
          </div>
        </div>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="bg-neutral-800 text-white py-6 mt-auto">
      <div class="container mx-auto px-4 text-center">
        <p class="text-neutral-400">© 2025 MIFENG CDN. 保留所有权利.</p>
        <p class="text-neutral-500 text-sm mt-2">未经授权的使用将受到法律追究</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

// 状态管理
const loading = ref(true)
const visitorIP = ref('')
const monitors = ref([])
const loadingMonitors = ref(true)
const lastUpdated = ref('')

// API 配置
const uptimeRobotApiKeys = [
  'm800414753-7bdd0023a2213ed1230a01b6',
  'm800415016-17ff34d5d2c648037c9a3a58',
  'm800414968-8e69417d7eebc39ebe05abf8'

]
const ipApiUrl = 'https://v.api.aa1.cn/api/myip/index.php?aa1=text'
const monitorsApiUrl = 'https://api.uptimerobot.com/v2/getMonitors'

// 获取所有监测数据
const fetchMonitors = async () => {
  loadingMonitors.value = true
  
  try {
    // 并行请求所有API密钥的数据
    const promises = uptimeRobotApiKeys.map(apiKey => 
      fetch(monitorsApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `api_key=${apiKey}&format=json&logs=0&response_times=1&response_times_limit=1`
      }).then(res => res.json())
    )
    
    const results = await Promise.all(promises)
    
    // 合并所有监测数据
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

// 刷新监测数据
const refreshMonitors = () => {
  fetchMonitors()
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '暂停',
    1: '未检查',
    2: '在线',
    8: '似乎离线',
    9: '离线'
  }
  return statusMap[status] || '未知状态'
}

// 初始化
onMounted(() => {
  fetchVisitorIP()
  fetchMonitors()
  
  // 设置定时刷新
  setInterval(fetchMonitors, 300000) // 每5分钟刷新监测数据
  setInterval(fetchVisitorIP, 600000) // 每10分钟刷新IP
})

// 获取访问者IP
const fetchVisitorIP = async () => {
  try {
    const response = await fetch(ipApiUrl)
    const htmlResponse = await response.text()
    
    const lines = htmlResponse.split('\n')
    const lastLine = lines[lines.length - 1].trim()
    
    // 增强IP验证
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}|(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$/
    if (ipRegex.test(lastLine)) {
      visitorIP.value = lastLine
    } else {
      console.warn('无效IP格式:', lastLine)
      visitorIP.value = '无法获取'
    }
  } catch (error) {
    console.error('IP获取失败:', error)
    visitorIP.value = '请求失败'
  } finally {
    loading.value = false
  }
}

// 计算可用性
const availability = computed(() => {
  if (!monitors.value.length) return '99.99'
  
  const totalMonitors = monitors.value.length
  const onlineMonitors = monitors.value.filter(m => m.status === 2).length
  
  // 计算可用性百分比
  const percentage = (onlineMonitors / totalMonitors * 100).toFixed(2)
  return percentage
})
</script>

<style>
/* 隐藏滚动条但保持可滚动 */
.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
  overflow: -moz-scrollbars-none;
}

.scrollbar-hide::-webkit-scrollbar,
.scrollbar-hide::-webkit-scrollbar-thumb,
.scrollbar-hide::-webkit-scrollbar-track {
  width: 0 !important;
  height: 0 !important;
  display: none !important;
  background: transparent !important;
}
</style>


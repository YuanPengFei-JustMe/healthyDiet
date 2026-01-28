/**
 * 通用请求封装 (基于 uniCloud.importObject)
 * @param {string} serviceName 云对象名称
 * @param {string} methodName 方法名称
 * @param {object} params 参数
 * @param {object} options 选项 (loading, toast, etc.)
 */
export async function request(serviceName: string, methodName: string, params: any = {}, options: any = {}) {
    const { showLoading = true, showToast = true } = options

    if (showLoading) {
        uni.showLoading({ title: '加载中...' })
    }

    try {
        const cloudObject = uniCloud.importObject(serviceName, {
            customUI: true // 防止云对象自动弹出错误提示，由我们自己处理
        })

        // 动态调用方法
        const res = await cloudObject[methodName](...Object.values(params))

        if (showLoading) {
            uni.hideLoading()
        }

        // 统一处理业务状态码 (假设约定 code: 0 为成功)
        if (res.code === 0) {
            return res.data
        } else {
            if (showToast) {
                uni.showToast({ title: res.msg || '请求失败', icon: 'none' })
            }
            return Promise.reject(res)
        }
    } catch (err: any) {
        if (showLoading) {
            uni.hideLoading()
        }
        console.error(`[Cloud Request Error] ${serviceName}.${methodName}:`, err)

        const errMsg = err.message || '网络异常，请稍后重试'
        if (showToast) {
            uni.showToast({ title: errMsg, icon: 'none' })
        }
        return Promise.reject(err)
    }
}

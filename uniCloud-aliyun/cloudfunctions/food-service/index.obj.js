// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程: https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
module.exports = {
    _before: function () { // 通用预处理器
    },
    /**
     * 搜索食物
     * @param {string} keyword 关键词
     * @param {string} type 分类/排序类型: 'purine' (按嘌呤排序), 'gi' (按GI排序), default (默认)
     * @returns {object} { code, msg, data }
     */
    async searchFood(keyword, type) {
        const db = uniCloud.database()
        const collection = db.collection('food_library')

        // 构建查询条件
        let whereClause = {}
        if (keyword) {
            // 模糊搜索 name 字段
            whereClause.name = new RegExp(keyword, 'i')
        }

        // 初始化查询构建器
        let queryBuilder = collection.where(whereClause)

        // 处理排序
        if (type === 'purine') {
            // 嘌呤含量：由低到高（适合痛风人群）
            queryBuilder = queryBuilder.orderBy('purine_per_100g', 'asc')
        } else if (type === 'gi') {
            // GI值：由低到高（适合控糖人群）
            queryBuilder = queryBuilder.orderBy('gi_value', 'asc')
        } else {
            // 默认排序 (例如按相关性或更新时间，这里暂时按创建时间倒序)
            queryBuilder = queryBuilder.orderBy('created_at', 'desc')
        }

        // 执行查询，限制返回数量
        const res = await queryBuilder.limit(20).get()

        return {
            code: 0,
            msg: 'success',
            data: res.data
        }
    },

    /**
     * 获取低嘌呤榜单
     */
    async getLowPurineRank() {
        const db = uniCloud.database()
        const res = await db.collection('food_library')
            .where({
                purine_per_100g: db.command.exists(true)
            })
            .orderBy('purine_per_100g', 'asc')
            .limit(5)
            .get()

        return {
            code: 0,
            msg: 'success',
            data: res.data
        }
    },

    /**
     * 获取食物详情
     * @param {string} id 食物ID
     */
    async getFoodDetail(id) {
        if (!id) {
            return {
                code: -1,
                msg: '参数错误'
            }
        }

        const db = uniCloud.database()

        // 1. 获取食物基本信息
        const foodRes = await db.collection('food_library').doc(id).get()
        if (foodRes.data.length === 0) {
            return {
                code: 404,
                msg: '食物不存在'
            }
        }
        const food = foodRes.data[0]

        // 2. 获取关联菜谱 (这里简化为查询原料中包含该食物ID的菜谱，或者随机推荐)
        //由于目前recipes_seed.json中结构是 ingredients: [{food_id: '...'}]，我们可以尝试匹配
        // 如果没有直接关联，从库中随机取几个作为演示
        let recipes = []
        try {
            const recipeRes = await db.collection('recipes')
                .where({
                    'ingredients.food_id': id
                })
                .limit(5)
                .get()

            recipes = recipeRes.data

            // 如果没有关联菜谱，兜底推荐一些（演示用）
            if (recipes.length === 0) {
                const randomRes = await db.collection('recipes').limit(5).get()
                recipes = randomRes.data
            }

        } catch (e) {
            console.error('Fetch recipes failed', e)
        }

        return {
            code: 0,
            msg: 'success',
            data: {
                ...food,
                related_recipes: recipes
            }
        }
    }
}
